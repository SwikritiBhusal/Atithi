import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './overview.css';
import Logo from "../../assets/images/atithi-high-resolution-logo.png";
import { 
  Home, 
  Users, 
  Building2, 
  LogOut,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data - replace with real API calls
  const [stats, setStats] = useState({
    totalHomestays: 24,
    pendingHomestays: 5,
    totalUsers: 156,
    registeredHosts: 18,
    activeBookings: 12
  });

  // Mock data for line chart - last 30 days
  const [bookingsData] = useState([
    { day: 1, bookings: 3 },
    { day: 3, bookings: 5 },
    { day: 5, bookings: 4 },
    { day: 7, bookings: 7 },
    { day: 9, bookings: 6 },
    { day: 11, bookings: 8 },
    { day: 13, bookings: 10 },
    { day: 15, bookings: 9 },
    { day: 17, bookings: 12 },
    { day: 19, bookings: 11 },
    { day: 21, bookings: 14 },
    { day: 23, bookings: 13 },
    { day: 25, bookings: 15 },
    { day: 27, bookings: 16 },
    { day: 30, bookings: 14 }
  ]);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      const result = await response.json();
      
      if (result.success) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Trigger storage event for Navbar to update
        window.dispatchEvent(new Event('storage'));
        
        alert("Logged out successfully!");
        navigate("/");
        
        // Force page reload to ensure Navbar re-renders
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
      // Clear anyway even if API fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Trigger storage event
      window.dispatchEvent(new Event('storage'));
      
      navigate("/");
      window.location.reload();
    }
  };

  const renderOverview = () => (
    <div className="admin-overview">
      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card card-purple">
          <div className="stat-icon">
            <Building2 size={28} />
          </div>
          <div className="stat-content">
            <h3>Total Homestays</h3>
            <div className="stat-value">
              {stats.totalHomestays}
              {stats.pendingHomestays > 0 && (
                <span className="stat-badge">{stats.pendingHomestays} pending</span>
              )}
            </div>
          </div>
        </div>

        <div className="admin-stat-card card-blue">
          <div className="stat-icon">
            <Users size={28} />
          </div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
        </div>

        <div className="admin-stat-card card-green">
          <div className="stat-icon">
            <TrendingUp size={28} />
          </div>
          <div className="stat-content">
            <h3>Active Bookings</h3>
            <div className="stat-value">{stats.activeBookings}</div>
          </div>
        </div>

        <div className="admin-stat-card card-orange">
          <div className="stat-icon">
            <Users size={28} />
          </div>
          <div className="stat-content">
            <h3>Registered Hosts</h3>
            <div className="stat-value">{stats.registeredHosts}</div>
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="admin-chart-container">
        <h3 className="chart-title">Bookings Over Last 30 Days</h3>
        <div className="line-chart">
          <svg viewBox="0 0 800 300" className="chart-svg">
            {/* Grid lines */}
            <g className="grid-lines">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <line
                  key={i}
                  x1="40"
                  y1={250 - (i * 50)}
                  x2="780"
                  y2={250 - (i * 50)}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}
            </g>

            {/* Y-axis labels */}
            <g className="y-axis-labels">
              {[0, 5, 10, 15, 20].map((value, i) => (
                <text
                  key={value}
                  x="30"
                  y={255 - (i * 50)}
                  fontSize="12"
                  fill="#6b7280"
                  textAnchor="end"
                >
                  {value}
                </text>
              ))}
            </g>

            {/* Gradient definition */}
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Area fill */}
            <path
              d={`M 40 250 ${bookingsData.map((d, i) => {
                const x = 40 + (i * (740 / (bookingsData.length - 1)));
                const y = 250 - (d.bookings * 12.5);
                return `L ${x} ${y}`;
              }).join(' ')} L 780 250 Z`}
              fill="url(#areaGradient)"
            />

            {/* Line path */}
            <path
              d={bookingsData.map((d, i) => {
                const x = 40 + (i * (740 / (bookingsData.length - 1)));
                const y = 250 - (d.bookings * 12.5);
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="line-path"
            />

            {/* Data points */}
            {bookingsData.map((d, i) => {
              const x = 40 + (i * (740 / (bookingsData.length - 1)));
              const y = 250 - (d.bookings * 12.5);
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill="white"
                    stroke="#8b5cf6"
                    strokeWidth="3"
                    className="data-point"
                  />
                  {/* Tooltip on hover */}
                  <circle
                    cx={x}
                    cy={y}
                    r="15"
                    fill="transparent"
                    className="data-point-hover"
                    data-bookings={d.bookings}
                    data-day={d.day}
                  />
                </g>
              );
            })}

            {/* X-axis labels */}
            <g className="x-axis-labels">
              {bookingsData.filter((_, i) => i % 3 === 0).map((d, i) => {
                const originalIndex = bookingsData.findIndex(item => item.day === d.day);
                const x = 40 + (originalIndex * (740 / (bookingsData.length - 1)));
                return (
                  <text
                    key={d.day}
                    x={x}
                    y="275"
                    fontSize="12"
                    fill="#6b7280"
                    textAnchor="middle"
                  >
                    Day {d.day}
                  </text>
                );
              })}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );

  // const renderHomestays = () => (
  //   <div className="admin-content-section">
  //     <h2>Homestays Management</h2>
  //     <p>Homestay management content here...</p>
  //   </div>
  // );

  // const renderUsers = () => (
  //   <div className="admin-content-section">
  //     <h2>Users Management</h2>
  //     <p>Users management content here...</p>
  //   </div>
  // );

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
           <h2>Admin Panel</h2>
          <div className="logo-wrapperr">
            <div className="logo-boxx" onClick={() => navigate("/")}>
              <img src={Logo} alt="Namaste Logo" className="logo-imagee" />
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className="nav-item active"
            onClick={() => navigate('/Admin/overview')}
          >
            <Home size={20} />
            <span>Overview</span>
          </button>

          <button
            className="nav-item"
            onClick={() => navigate('/Admin/homestays')}
          >
            <Building2 size={20} />
            <span>Homestays</span>
          </button>

          <button
            className="nav-item"
            onClick={() => navigate('/Admin/users')}
          >
            <Users size={20} />
            <span>Users</span>
          </button>

          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
          <div className="admin-header">
          <h1>Dashboard Overview</h1>
          <div className="admin-user-info">
            <span>Admin</span>
          </div>
        </div>

        <div className="admin-content">
          {renderOverview()}
        </div>
      </main>
    </div>
  );
}