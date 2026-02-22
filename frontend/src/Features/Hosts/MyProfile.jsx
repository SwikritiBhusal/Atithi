import React from 'react';
import { User } from 'lucide-react';

export default function HostProfile() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <User size={64} style={{ color: '#cbd5e1', marginBottom: '24px' }} />
      <h2 style={{ fontSize: '24px', color: '#1e293b', marginBottom: '8px' }}>
        Profile Settings Coming Soon
      </h2>
      <p style={{ fontSize: '16px', color: '#64748b' }}>
        Edit your profile information, change password, and manage account settings.
      </p>
    </div>
  );
}