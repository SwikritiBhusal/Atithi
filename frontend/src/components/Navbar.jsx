import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
import Logo from '../assets/images/atithi-high-resolution-logo.png';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Check if we're on admin pages
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    const checkLoginStatus = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setIsLoggedIn(true);
        setUserRole(user.role);
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };

    // Check on mount and when location changes
    checkLoginStatus();

    // Listen for storage changes
    window.addEventListener('storage', checkLoginStatus);
    
    return () => window.removeEventListener('storage', checkLoginStatus);
  }, [location]); // ← Add location as dependency!

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
        setIsLoggedIn(false);
        setUserRole(null);
        alert("Logged out successfully!");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setUserRole(null);
      navigate("/");
    }
  };

  // Don't show navbar on admin dashboard pages
  if (isAdminPage) {
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

        {/* Center: Navigation Links - SHOW FOR EVERYONE */}
        <div className="nav-links">
          <span onClick={() => navigate("/")}>Home</span>
          <span onClick={() => navigate("/homestayListings")}>HomestayListings</span>
          <span onClick={() => navigate("/about")}>About Us</span>
          <span onClick={() => navigate("/blog")}>Blog</span>
          <span onClick={() => navigate("/contact")}>Contact</span>
        </div>

        {/* Right: Buttons based on role */}
        <div className="nav-right">
          {/* Show different buttons based on role and login status */}
          {userRole === 'admin' ? (
            // Admin sees Dashboard button
            <button className="btn-dashboard" onClick={() => navigate("/admin/overview")}>
              📊 Dashboard
            </button>
          ) : userRole === 'host' ? (
            // Host sees their dashboard button
            <button className="btn-dashboard" onClick={() => navigate("/host/dashboard")}>
              🏠 My Dashboard
            </button>
          ) : (
            // Tourist/Not logged in see Add Your Stay
            <button className="btn-add-stay" onClick={() => navigate("/HomestayForm")}>
              + Add Your Stay
            </button>
          )}

          <div className="nav-buttons">
            {isLoggedIn ? (
              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
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