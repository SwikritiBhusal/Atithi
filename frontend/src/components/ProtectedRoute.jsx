import React from 'react';
import { Navigate } from 'react-router-dom';

// Protected Route for Admin only
export const AdminProtectedRoute = ({ children }) => {
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    // Not logged in - redirect to login
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);
  
  if (user.role !== 'admin') {
    // Not admin - redirect to home
    return <Navigate to="/" replace />;
  }

  // Is admin - allow access
  return children;
};

// Protected Route for Host only
export const HostProtectedRoute = ({ children }) => {
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);
  
  if (user.role !== 'host') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Protected Route for authenticated users (any role)
export const AuthProtectedRoute = ({ children }) => {
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  return children;
};