import React, { useState, useEffect } from 'react';
import { Search, User, Mail, Phone,  Filter, Download } from 'lucide-react';
import './Users.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    tourists: 0,
    hosts: 0,
    admins: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/users', {
        credentials: 'include'
      });
      const result = await response.json();
      
      if (result.success) {
        setUsers(result.users);
        calculateStats(result.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersList) => {
    const stats = {
      total: usersList.length,
      tourists: usersList.filter(u => u.role === 'tourist').length,
      hosts: usersList.filter(u => u.role === 'host').length,
      admins: usersList.filter(u => u.role === 'admin').length
    };
    setStats(stats);
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.contactNumber?.includes(searchTerm);
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const exportToCSV = () => {
    const headers = ['Username', 'Email', 'Contact', 'Role'];
    const csvData = filteredUsers.map(user => [
      user.username,
      user.email,
      user.contactNumber || 'N/A',
      user.role,
     
    
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="au-loading">Loading users...</div>;
  }

  return (
    <div className="admin-users">
      {/* Header */}
      <div className="au-header">
        <div>
          <h1 className="au-title">Users Management</h1>
          <p className="au-subtitle">Manage all registered users</p>
        </div>
        <button className="au-export-btn" onClick={exportToCSV}>
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="au-stats">
        <div className="au-stat-card total">
          <div className="stat-icon">
            <User size={24} />
          </div>
          <div>
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>

        <div className="au-stat-card tourists">
          <div className="stat-icon">
            <User size={24} />
          </div>
          <div>
            <span className="stat-label">Tourists</span>
            <span className="stat-value">{stats.tourists}</span>
          </div>
        </div>

        <div className="au-stat-card hosts">
          <div className="stat-icon">
            <User size={24} />
          </div>
          <div>
            <span className="stat-label">Hosts</span>
            <span className="stat-value">{stats.hosts}</span>
          </div>
        </div>

        <div className="au-stat-card admins">
          <div className="stat-icon">
            <User size={24} />
          </div>
          <div>
            <span className="stat-label">Admins</span>
            <span className="stat-value">{stats.admins}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="au-filters">
        <div className="au-search">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="au-filter-group">
          <Filter size={16} />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="tourist">Tourists</option>
            <option value="host">Hosts</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        <div className="au-results">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="au-no-users">
          <User size={64} />
          <h3>No users found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="au-table-container">
          <table className="au-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user._id} style={{ animationDelay: `${index * 0.05}s` }}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        <User size={20} />
                      </div>
                      <div className="user-info">
                        <span className="user-name">{user.username}</span>
                        <span className="user-id">ID: {user._id.slice(-8)}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="email-cell">
                      <Mail size={14} />
                      {user.email}
                    </div>
                  </td>
                  <td>
                    <div className="phone-cell">
                      {user.contactNumber ? (
                        <>
                          <Phone size={14} />
                          {user.contactNumber}
                        </>
                      ) : (
                        <span className="not-provided">Not provided</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}