import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, User, LogOut, Menu, X } from 'lucide-react';
import './hostDashboard.css';
import MyHomestay from './MyHomestay';
import Logo from "../../assets/images/atithi-high-resolution-logo.png";
// import HostBookings from './HostBookings';
// import HostProfile from './MyProfile';

export default function HostDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('homestay');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(userStr);
    if (userData.role !== 'host') {
      alert('Access denied! Hosts only.');
      navigate('/');
      return;
    }
    
    setUser(userData);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      const result = await response.json();
      
      if (result.success) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('storage'));
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'homestay':
        return <MyHomestay />;
      case 'bookings':
        // return <HostBookings />;
      case 'profile':
        // return <MyProfile />;
      default:
        // return <MyHomestay />;
    }
  };

  if (!user) {
    return <div className="hd-loading">Loading...</div>;
  }

  return (
    <div className="host-dashboard">
      {/* Sidebar */}
      <aside className={`hd-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="hd-sidebar-header">
          <div className="hd-logo">
            <Home size={28} className="hd-logo-icon" />
            {sidebarOpen && <span className="hd-logo-text">Host Panel</span>}
          </div>
          
          <button className="hd-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <div className="logo-wrapperr">
                    <div className="logo-boxx" onClick={() => navigate("/")}>
                      <img src={Logo} alt="Namaste Logo" className="logo-imagee" />
                    </div>
                  </div>

        <div className="hd-user-info">
          <div className="hd-user-avatar">
            <User size={24} />
          </div>
          {sidebarOpen && (
            <div className="hd-user-details">
              <span className="hd-user-name">{user.username}</span>
              <span className="hd-user-role">Host Account</span>
            </div>
          )}
        </div>

        <nav className="hd-nav">
          <button
            className={`hd-nav-item ${activeTab === 'homestay' ? 'active' : ''}`}
            onClick={() => setActiveTab('homestay')}
          >
            <Home size={20} />
            {sidebarOpen && <span>My Homestay</span>}
          </button>

          <button
            className={`hd-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <Calendar size={20} />
            {sidebarOpen && <span>Bookings</span>}
            {/* {sidebarOpen && <span className="hd-badge">3</span>} */}
          </button>

          <button
            className={`hd-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={20} />
            {sidebarOpen && <span>Profile</span>}
          </button>
        </nav>

        <button className="hd-logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      {/* Main Content */}
      <main className={`hd-main ${sidebarOpen ? '' : 'expanded'}`}>
        <div className="hd-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}