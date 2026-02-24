import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Save, X, Mail, User as UserIcon, Lock, Phone } from 'lucide-react';
import Navbar from '../components/Navbar';
import './MyProfile.css';

export default function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    email: '',
    contactNumber: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('Please login to view your profile');
      navigate('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);
    setEditData({
      username: userData.username || '',
      email: userData.email || '',
      contactNumber: userData.contactNumber || ''
    });
  }, [navigate]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData({
      username: user.username || '',
      email: user.email || '',
      contactNumber: user.contactNumber || ''
    });
  };

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:5000/api/auth/update-profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editData)
      });

      const result = await response.json();
      
      if (result.success) {
        const updatedUser = { ...user, ...editData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setEditing(false);
        window.dispatchEvent(new Event('storage')); // Update navbar
        alert('✅ Profile updated successfully!');
      } else {
        alert('Failed to update: ' + result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters!');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`http://localhost:5000/api/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Password changed successfully!');
        setChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        alert('Failed to change password: ' + result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="up-loading">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="user-profile-page">
        <div className="user-profile-container">
          {/* Header */}
          <div className="up-header">
            <div className="up-avatar-section">
              <div className="up-large-avatar">
                <UserIcon size={48} />
              </div>
              <div>
                <h1 className="up-title">{user.username}</h1>
                <p className="up-subtitle">{user.email}</p>
              </div>
            </div>
            
            {!editing ? (
              <button className="up-edit-btn" onClick={handleEdit}>
                <Edit2 size={18} />
                Edit Profile
              </button>
            ) : (
              <div className="up-edit-actions">
                <button className="up-cancel-btn" onClick={handleCancel}>
                  <X size={18} />
                  Cancel
                </button>
                <button className="up-save-btn" onClick={handleSave} disabled={saving}>
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {/* Profile Section */}
          <div className="up-section">
            <h3 className="up-section-title">
              <UserIcon size={18} />
              Personal Information
            </h3>
            <div className="up-form">
              <div className="up-field">
                <label>
                  <UserIcon size={16} />
                  Username
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                  />
                ) : (
                  <p>{user.username}</p>
                )}
              </div>

              <div className="up-field">
                <label>
                  <Mail size={16} />
                  Email Address
                </label>
                {editing ? (
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                ) : (
                  <p>{user.email}</p>
                )}
              </div>

              <div className="up-field">
                <label>
                  <Phone size={16} />
                  Contact Number
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={editData.contactNumber}
                    onChange={(e) => handleChange('contactNumber', e.target.value)}
                  />
                ) : (
                  <p>{user.contactNumber || 'Not provided'}</p>
                )}
              </div>

              <div className="up-field">
                <label>Account Type</label>
                <p className="up-role-badge">{user.role.toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="up-section">
            <div className="up-section-header">
              <h3 className="up-section-title">
                <Lock size={18} />
                Password & Security
              </h3>
              {!changingPassword && (
                <button className="up-change-password-btn" onClick={() => setChangingPassword(true)}>
                  Change Password
                </button>
              )}
            </div>

            {changingPassword && (
              <div className="up-password-form">
                <div className="up-field">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="up-field">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div className="up-field">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="up-password-actions">
                  <button className="up-cancel-btn" onClick={() => {
                    setChangingPassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}>
                    Cancel
                  </button>
                  <button className="up-save-btn" onClick={handlePasswordUpdate} disabled={saving}>
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}