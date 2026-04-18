import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Edit2,
  Save,
  X,
  MapPin,
  Home,
  Users,
  DollarSign,
  Star,
  Ban
} from 'lucide-react';
import './MyHomestay.css';
import { useAppToast } from '../../components/toast';

const PHOTO_MIN_MB = 0.1;
const PHOTO_MAX_MB = 8;
const toMB = (bytes) => bytes / (1024 * 1024);

const validateReplacementPhoto = (file) => {
  if (!file) return 'No photo selected.';

  const mb = toMB(file.size);
  const ext = file.name.split('.').pop().toLowerCase();
  const allowed = ['jpg', 'jpeg', 'png', 'webp'];

  if (!allowed.includes(ext)) return `Only JPG, PNG, WEBP allowed (got .${ext})`;
  if (mb < PHOTO_MIN_MB) return `Photo too small (min ${PHOTO_MIN_MB * 1000}KB).`;
  if (mb > PHOTO_MAX_MB) return `Photo too large (max ${PHOTO_MAX_MB}MB). Got ${mb.toFixed(1)}MB`;
  return '';
};

export default function MyHomestay() {
  const toast = useAppToast();
  const [homestay, setHomestay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [photoReplacements, setPhotoReplacements] = useState({});
  const [replaceTargetIndex, setReplaceTargetIndex] = useState(null);
  const replaceInputRef = useRef(null);

  useEffect(() => {
    fetchMyHomestay();
  }, []);

  const previewPhotos = useMemo(() => {
    const basePhotos = homestay?.homestayPhotos || [];
    if (!editing) return basePhotos;

    return basePhotos.map((photo, index) => {
      const replacement = photoReplacements[index];
      if (!replacement) return photo;
      return { ...photo, url: URL.createObjectURL(replacement) };
    });
  }, [editing, homestay, photoReplacements]);

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
    setPhotoReplacements({});
    setReplaceTargetIndex(null);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData({ ...homestay });
    setPhotoReplacements({});
    setReplaceTargetIndex(null);
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

  const handlePhotoSelection = (fileList) => {
    const file = fileList?.[0];
    if (replaceTargetIndex === null || !file) return;

    const photoError = validateReplacementPhoto(file);
    if (photoError) {
      toast.error('Invalid Photo', photoError);
      setReplaceTargetIndex(null);
      return;
    }

    setPhotoReplacements((prev) => ({
      ...prev,
      [replaceTargetIndex]: file
    }));
    setReplaceTargetIndex(null);
  };

  const openReplacePhotoPicker = (index) => {
    setReplaceTargetIndex(index);
    if (replaceInputRef.current) {
      replaceInputRef.current.value = '';
      replaceInputRef.current.click();
    }
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

      const replacementEntries = Object.entries(photoReplacements)
        .map(([index, file]) => ({ index: Number(index), file }))
        .sort((a, b) => a.index - b.index);

      replacementEntries.forEach((entry) => {
        formData.append('homestayPhotos', entry.file);
      });
      formData.append('replacePhotoIndices', JSON.stringify(replacementEntries.map((entry) => entry.index)));

      const response = await fetch(`http://localhost:5000/api/homestay/update/${homestay._id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Homestay Updated', 'Homestay updated successfully.');
        setHomestay(result.homestay);
        setEditData(result.homestay);
        setEditing(false);
        setPhotoReplacements({});
        setReplaceTargetIndex(null);
      } else {
        toast.error('Update Failed', `Failed to update: ${result.message}`);
      }
    } catch (error) {
      console.error('Error updating:', error);
      toast.error('Update Failed', 'Failed to update homestay.');
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
              <p className="mh-photo-help">
                Click the replace button on each photo you want to change.
                Replaced photos: {Object.keys(photoReplacements).length}. JPG/PNG/WEBP only, 100KB to 8MB each.
              </p>
              <input
                ref={replaceInputRef}
                type="file"
                accept="image/jpg,image/jpeg,image/png,image/webp"
                onChange={(e) => handlePhotoSelection(e.target.files)}
                style={{ display: 'none' }}
              />
            </div>
          )}
          <div className="mh-photos-grid">
            {previewPhotos.map((photo, index) => (
              <div key={index} className="mh-photo">
                <img src={photo.url} alt={`Photo ${index + 1}`} />
                <span className="mh-photo-number">{index + 1}</span>
                {editing && (
                  <div className="mh-photo-edit-actions">
                    <button
                      type="button"
                      className="mh-photo-replace-btn"
                      onClick={() => openReplacePhotoPicker(index)}
                    >
                      Replace
                    </button>
                    {photoReplacements[index] && (
                      <button
                        type="button"
                        className="mh-photo-undo-btn"
                        onClick={() => {
                          setPhotoReplacements((prev) => {
                            const updated = { ...prev };
                            delete updated[index];
                            return updated;
                          });
                        }}
                      >
                        Undo
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
