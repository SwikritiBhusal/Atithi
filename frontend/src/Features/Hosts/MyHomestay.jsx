import React, { useEffect, useMemo, useState } from 'react';
import {
  Edit2,
  Save,
  X,
  MapPin,
  Home,
  Users,
  DollarSign,
  Star,
  Upload,
  Ban
} from 'lucide-react';
import './MyHomestay.css';

export default function MyHomestay() {
  const [homestay, setHomestay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [newPhotos, setNewPhotos] = useState([]);

  useEffect(() => {
    fetchMyHomestay();
  }, []);

  const previewPhotos = useMemo(() => {
    if (editing && newPhotos.length > 0) {
      return newPhotos.map((photo) => ({
        url: URL.createObjectURL(photo)
      }));
    }

    return homestay?.homestayPhotos || [];
  }, [editing, homestay, newPhotos]);

  useEffect(() => {
    return () => {
      previewPhotos.forEach((photo) => {
        if (photo.url?.startsWith('blob:')) {
          URL.revokeObjectURL(photo.url);
        }
      });
    };
  }, [previewPhotos]);

  const fetchMyHomestay = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:5000/api/homestay/my-homestay/${user.id}`, {
        credentials: 'include'
      });
      const result = await response.json();

      if (result.success) {
        setHomestay(result.homestay);
        setEditData(result.homestay);
      }
    } catch (error) {
      console.error('Error fetching homestay:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditData({ ...homestay });
    setNewPhotos([]);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData({ ...homestay });
    setNewPhotos([]);
  };

  const handleChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFacilityToggle = (facility) => {
    setEditData((prev) => ({
      ...prev,
      facilities: (prev.facilities || []).includes(facility)
        ? (prev.facilities || []).filter((item) => item !== facility)
        : [...(prev.facilities || []), facility]
    }));
  };

  const handlePhotoSelection = (files) => {
    setNewPhotos(Array.from(files || []));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('homestayName', editData.homestayName || '');
      formData.append('description', editData.description || '');
      formData.append('rooms', String(editData.rooms || 0));
      formData.append('blockedRooms', String(editData.blockedRooms || 0));
      formData.append('guests', String(editData.guests || 0));
      formData.append('price', String(editData.price || 0));
      formData.append('checkIn', editData.checkIn || '');
      formData.append('checkOut', editData.checkOut || '');
      formData.append('facilities', JSON.stringify(editData.facilities || []));

      newPhotos.forEach((photo) => {
        formData.append('homestayPhotos', photo);
      });

      const response = await fetch(`http://localhost:5000/api/homestay/update/${homestay._id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        alert('Homestay updated successfully!');
        setHomestay(result.homestay);
        setEditData(result.homestay);
        setEditing(false);
        setNewPhotos([]);
      } else {
        alert(`Failed to update: ${result.message}`);
      }
    } catch (error) {
      console.error('Error updating:', error);
      alert('Failed to update homestay');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="mh-loading">Loading your homestay...</div>;
  }

  if (!homestay) {
    return (
      <div className="mh-no-homestay">
        <Home size={64} className="mh-empty-icon" />
        <h2>No Homestay Found</h2>
        <p>You haven't listed a homestay yet or it's pending approval.</p>
      </div>
    );
  }

  return (
    <div className="my-homestay">
      <div className="mh-header">
        <div>
          <h1 className="mh-title">My Homestay</h1>
          <p className="mh-subtitle">Manage your homestay listing, gallery, and room availability</p>
        </div>

        {!editing ? (
          <button className="mh-edit-btn" onClick={handleEdit}>
            <Edit2 size={18} />
            Edit Details
          </button>
        ) : (
          <div className="mh-edit-actions">
            <button className="mh-cancel-btn" onClick={handleCancel}>
              <X size={18} />
              Cancel
            </button>
            <button className="mh-save-btn" onClick={handleSave} disabled={saving}>
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className={`mh-status-badge ${homestay.status}`}>
        <span className="status-dot"></span>
        Status: {homestay.status.charAt(0).toUpperCase() + homestay.status.slice(1)}
      </div>

      <div className="mh-overview">
        <div className="mh-card">
          <div className="mh-card-icon blue">
            <Home size={24} />
          </div>
          <div>
            <span className="mh-card-label">Total Rooms</span>
            <span className="mh-card-value">{homestay.rooms}</span>
          </div>
        </div>

        <div className="mh-card">
          <div className="mh-card-icon red">
            <Ban size={24} />
          </div>
          <div>
            <span className="mh-card-label">Blocked Rooms</span>
            <span className="mh-card-value">{homestay.blockedRooms || 0}</span>
          </div>
        </div>

        <div className="mh-card">
          <div className="mh-card-icon green">
            <Users size={24} />
          </div>
          <div>
            <span className="mh-card-label">Guests per Room</span>
            <span className="mh-card-value">{homestay.guests || 2}</span>
          </div>
        </div>

        <div className="mh-card">
          <div className="mh-card-icon orange">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="mh-card-label">Price per Night</span>
            <span className="mh-card-value">NPR {homestay.price?.toLocaleString()}</span>
          </div>
        </div>

        <div className="mh-card">
          <div className="mh-card-icon purple">
            <Star size={24} />
          </div>
          <div>
            <span className="mh-card-label">Rooms Available Now</span>
            <span className="mh-card-value">{homestay.availableRooms ?? homestay.rooms}</span>
          </div>
        </div>
      </div>

      <div className="mh-sections">
        <div className="mh-section">
          <h3 className="mh-section-title">Basic Information</h3>
          <div className="mh-form">
            <div className="mh-field">
              <label>Homestay Name</label>
              {editing ? (
                <input
                  type="text"
                  value={editData.homestayName || ''}
                  onChange={(e) => handleChange('homestayName', e.target.value)}
                />
              ) : (
                <p>{homestay.homestayName}</p>
              )}
            </div>

            <div className="mh-field full-width">
              <label>Description</label>
              {editing ? (
                <textarea
                  value={editData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows="4"
                />
              ) : (
                <p>{homestay.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mh-section">
          <h3 className="mh-section-title">
            <MapPin size={18} />
            Location
          </h3>
          <div className="mh-form">
            <div className="mh-field">
              <label>Province</label>
              <p>{homestay.province}</p>
            </div>
            <div className="mh-field">
              <label>District</label>
              <p>{homestay.district}</p>
            </div>
            <div className="mh-field">
              <label>Municipality</label>
              <p>{homestay.municipality}</p>
            </div>
            <div className="mh-field">
              <label>Ward</label>
              <p>{homestay.ward || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="mh-section">
          <h3 className="mh-section-title">Stay Details</h3>
          <div className="mh-form">
            <div className="mh-field">
              <label>Rooms</label>
              {editing ? (
                <input
                  type="number"
                  value={editData.rooms || 1}
                  onChange={(e) => handleChange('rooms', parseInt(e.target.value, 10) || 1)}
                  min="1"
                />
              ) : (
                <p>{homestay.rooms}</p>
              )}
            </div>

            <div className="mh-field">
              <label>Blocked Rooms</label>
              {editing ? (
                <input
                  type="number"
                  value={editData.blockedRooms || 0}
                  onChange={(e) => handleChange('blockedRooms', parseInt(e.target.value, 10) || 0)}
                  min="0"
                  max={editData.rooms || 0}
                />
              ) : (
                <p>{homestay.blockedRooms || 0}</p>
              )}
            </div>

            <div className="mh-field">
              <label>Guests per Room</label>
              {editing ? (
                <input
                  type="number"
                  value={editData.guests || 1}
                  onChange={(e) => handleChange('guests', parseInt(e.target.value, 10) || 1)}
                  min="1"
                />
              ) : (
                <p>{homestay.guests}</p>
              )}
            </div>

            <div className="mh-field">
              <label>Price per Night (NPR)</label>
              {editing ? (
                <input
                  type="number"
                  value={editData.price || 0}
                  onChange={(e) => handleChange('price', parseInt(e.target.value, 10) || 0)}
                  min="0"
                />
              ) : (
                <p>NPR {homestay.price?.toLocaleString()}</p>
              )}
            </div>

            <div className="mh-field">
              <label>Check-in Time</label>
              {editing ? (
                <input
                  type="time"
                  value={editData.checkIn || ''}
                  onChange={(e) => handleChange('checkIn', e.target.value)}
                />
              ) : (
                <p>{homestay.checkIn || 'N/A'}</p>
              )}
            </div>

            <div className="mh-field">
              <label>Check-out Time</label>
              {editing ? (
                <input
                  type="time"
                  value={editData.checkOut || ''}
                  onChange={(e) => handleChange('checkOut', e.target.value)}
                />
              ) : (
                <p>{homestay.checkOut || 'N/A'}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mh-section">
          <h3 className="mh-section-title">Facilities</h3>
          <div className="mh-facilities">
            {['Local Food', 'Cultural Experience', 'Hot Water', 'Free Wi-Fi', 'Nature View', 'Peaceful Environment'].map((facility) => (
              <label key={facility} className={`mh-facility ${editing ? 'editable' : ''}`}>
                <input
                  type="checkbox"
                  checked={editing ? editData.facilities?.includes(facility) : homestay.facilities?.includes(facility)}
                  onChange={() => handleFacilityToggle(facility)}
                  disabled={!editing}
                />
                <span>{facility}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mh-section">
          <h3 className="mh-section-title">Photos ({previewPhotos.length || 0})</h3>
          {editing && (
            <div className="mh-photo-upload">
              <label className="mh-upload-box">
                <Upload size={20} />
                <span>{newPhotos.length ? `${newPhotos.length} new photo(s) selected` : 'Choose new photos to replace your current gallery'}</span>
                <small>Selecting photos will replace the existing gallery across details and listing pages.</small>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePhotoSelection(e.target.files)}
                />
              </label>
            </div>
          )}
          <div className="mh-photos-grid">
            {previewPhotos.map((photo, index) => (
              <div key={index} className="mh-photo">
                <img src={photo.url} alt={`Photo ${index + 1}`} />
                <span className="mh-photo-number">{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
