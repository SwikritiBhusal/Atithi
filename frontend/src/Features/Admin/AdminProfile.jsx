import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, Mail, User as UserIcon, Lock } from 'lucide-react';
import './AdminProfile.css';

export default function AdminProfile() {
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
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setEditData({
        username: userData.username || '',
        email: userData.email || '',
        contactNumber: userData.contactNumber || ''
      });
    }
  }, []);

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
    return <div className="ap-loading">Loading...</div>;
  }

  return (
    <div className="admin-profile">
      {/* Header */}
      <div className="ap-header">
        <div>
          <h1 className="ap-title">My Profile</h1>
          <p className="ap-subtitle">Manage your account settings</p>
        </div>
        
        {!editing ? (
          <button className="ap-edit-btn" onClick={handleEdit}>
            <Edit2 size={18} />
            Edit Profile
          </button>
        ) : (
          <div className="ap-edit-actions">
            <button className="ap-cancel-btn" onClick={handleCancel}>
              <X size={18} />
              Cancel
            </button>
            <button className="ap-save-btn" onClick={handleSave} disabled={saving}>
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Profile Section */}
      <div className="ap-section">
        <h3 className="ap-section-title">
          <UserIcon size={18} />
          Personal Information
        </h3>
        <div className="ap-form">
          <div className="ap-field">
            <label>Username</label>
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

          <div className="ap-field">
            <label>Email</label>
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

          <div className="ap-field">
            <label>Contact Number</label>
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

          <div className="ap-field">
            <label>Role</label>
            <p className="ap-role-badge">{user.role.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="ap-section">
        <div className="ap-section-header">
          <div>
            <h3 className="ap-section-title">
              <Lock size={18} />
              Password & Security
            </h3>
          </div>
          {!changingPassword && (
            <button className="ap-change-password-btn" onClick={() => setChangingPassword(true)}>
              Change Password
            </button>
          )}
        </div>

        {changingPassword && (
          <div className="ap-password-form">
            <div className="ap-field">
              <label>Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                placeholder="Enter current password"
              />
            </div>

            <div className="ap-field">
              <label>New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                placeholder="Enter new password (min 6 characters)"
              />
            </div>

            <div className="ap-field">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                placeholder="Confirm new password"
              />
            </div>

            <div className="ap-password-actions">
              <button className="ap-cancel-btn" onClick={() => {
                setChangingPassword(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}>
                Cancel
              </button>
              <button className="ap-save-btn" onClick={handlePasswordUpdate} disabled={saving}>
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}