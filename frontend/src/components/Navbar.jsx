import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Settings, LogOut, ChevronDown, Calendar, Heart } from "lucide-react";
import NotificationBell from "./NotificationBell";
import "./Navbar.css";
import Logo from '../assets/images/atithi-high-resolution-logo.png';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Check if we're on admin/host dashboard pages
  const isAdminPage = location.pathname.startsWith('/admin');
  const isHostPage = location.pathname.startsWith('/host');

  useEffect(() => {
    const checkLoginStatus = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setIsLoggedIn(true);
        setUserRole(user.role);
        setUserName(user.username || 'User');
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        setUserName('');
      }
    };

    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    
    return () => window.removeEventListener('storage', checkLoginStatus);
  }, [location]);

  useEffect(() => {
    const fetchFavoritesCount = async () => {
      if (!isLoggedIn) {
        setFavoritesCount(0);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/user/favorites', {
          credentials: 'include',
        });
        const result = await response.json();
        if (result.success && Array.isArray(result.favorites)) {
          setFavoritesCount(result.favorites.length);
        } else {
          setFavoritesCount(0);
        }
      } catch (error) {
        console.error('Failed to fetch favorites count', error);
        setFavoritesCount(0);
      }
    };

    fetchFavoritesCount();

    const handleFavoritesUpdated = () => {
      fetchFavoritesCount();
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdated);
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdated);
    };
  }, [isLoggedIn]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      const result = await response.json();
      
      if (result.success) {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        //  Dispatch custom event for NotificationContext
        window.dispatchEvent(new Event('userChanged'));
        
        setIsLoggedIn(false);
        setUserRole(null);
        setShowDropdown(false);
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Dispatch event even on error
      window.dispatchEvent(new Event('userChanged'));
      
      setIsLoggedIn(false);
      setUserRole(null);
      navigate("/");
    }
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    if (userRole === 'admin') {
      navigate('/Admin/overview');
    } else if (userRole === 'host') {
      navigate('/Hosts/hostDashboard');
    } else {
      navigate('/MyProfile');
    }
  };

  const handleDashboardClick = () => {
    setShowDropdown(false);
    if (userRole === 'admin') {
      navigate('/Admin/overview');
    } else if (userRole === 'host') {
      navigate('/Hosts/hostDashboard');
    }
  };

  const handleMyBookingsClick = () => {
    setShowDropdown(false);
    navigate('/my-bookings');
  };
  const handleMyRecommendationsClick = () => {
    setShowDropdown(false);
    navigate('/my-recommendations');
  };



  // Don't show navbar on admin/host dashboard pages
  if (isAdminPage || isHostPage) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Left: Clickable Logo */}
        <div className="logo" onClick={() => navigate("/")}>
          <div className="profile-logo">
            <img src={Logo} alt="Atithi Logo" />
          </div>
        </div>

        {/* Center: Navigation Links */}
        <div className="nav-links">
          <span onClick={() => navigate("/")}>Home</span>
          <span onClick={() => navigate("/homestayListings")}>Homestays</span>
          <span onClick={() => navigate("/about")}>About Us</span>
          <span onClick={() => navigate("/contact")}>Contact</span>
        </div>

        {/* Right: Buttons and Profile */}
        <div className="nav-right">
          {/* Dashboard button for admin/host */}
          {userRole === 'admin' && (
            <button className="btn-dashboard" onClick={handleDashboardClick}>
              📊 Dashboard
            </button>
          )}
          {userRole === 'host' && (
            <button className="btn-dashboard" onClick={handleDashboardClick}>
               My Dashboard
            </button>
          )}

          {/* Add Your Stay button for tourists/not logged in */}
         {(!isLoggedIn || userRole === 'tourist') && (
  <button
    className="btn-add-stay"
    onClick={() => {
      if (!isLoggedIn) {
        navigate('/login', { 
          state: { 
            from: '/HomestayForm',
            message: 'Please login or register first to add your homestay!' 
          } 
        });
      } else {
        navigate('/HomestayForm');
      }
    }}
  >
    + Add Your Stay
  </button>
)}

          <div className="nav-buttons">
            {isLoggedIn && (
              <button
                className="favorites-btn"
                onClick={() => navigate('/favorites')}
                title="My Favorites"
              >
                <Heart size={18} />
                {favoritesCount > 0 && (
                  <span className="favorites-badge">{favoritesCount}</span>
                )}
              </button>
            )}
            {isLoggedIn && <NotificationBell />}
            {isLoggedIn ? (
              <div className="profile-dropdown-container" ref={dropdownRef}>
                <button 
                  className="profile-avatar-btn"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="avatar-circle">
                    <User size={18} />
                  </div>
                  <span className="avatar-name">{userName}</span>
                  <ChevronDown size={16} className={`dropdown-arrow ${showDropdown ? 'open' : ''}`} />
                </button>

                {showDropdown && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">
                        <User size={24} />
                      </div>
                      <div className="dropdown-info">
                        <span className="dropdown-name">{userName}</span>
                        <span className="dropdown-role">{userRole}</span>
                      </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    <button className="dropdown-item" onClick={handleProfileClick}>
                      <Settings size={16} />
                      <span>My Profile</span>
                    </button>

                    {/* My Bookings - Only for Tourists */}
                    {userRole === 'tourist' && (
                      <button className="dropdown-item" onClick={handleMyBookingsClick}>
                        <Calendar size={16} />
                        <span>My Bookings</span>
                      </button>
                    )}
                    {userRole === 'tourist' && (
                      <button className="dropdown-item" onClick={handleMyRecommendationsClick}>
                        <Calendar size={16} />
                        <span>My Recommendations</span>
                      </button>
                    )}


                    {/* Dashboard - Only for Admin/Host */}
                    {(userRole === 'admin' || userRole === 'host') && (
                      <button className="dropdown-item" onClick={handleDashboardClick}>
                        <User size={16} />
                        <span>Dashboard</span>
                      </button>
                    )}

                    <div className="dropdown-divider"></div>

                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="btn-login" onClick={() => navigate("/login")}>
                  Login
                </button>
                <button className="btn-signup" onClick={() => navigate("/register")}>
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}