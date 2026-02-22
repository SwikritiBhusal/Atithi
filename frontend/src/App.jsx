// src/App.jsx
import { useState } from 'react';
import { Home } from 'lucide-react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import RegisterPage from './Features/auth/register/register';
import LoginPage from './Features/auth/login/login';
import HomePage from './Features/homePage/home';

import EmailVerify from './Features/auth/EmailVerify';
import ResetPassword from './Features/auth/ResetPassword';
import ForgotPassword from './Features/auth/ForgotPassword';
import HomestayForm from './Features/HomestayForm';
import Overview from './Features/Admin/overview';
import Homestays from './Features/Admin/homestays';
import HomestayListings from './Features/homestayListings';
import HomestayDetails from './Features/homestayDetails';
import HostDashboard from './Features/Hosts/hostDashboard';

// Protected Routes
import { AdminProtectedRoute, HostProtectedRoute } from './components/ProtectedRoute';



function App() {
  const [count, setCount] = useState(0);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path='/home' element={<HomePage/>}/>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-email" element={<EmailVerify />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/HomestayForm" element={<HomestayForm />} /> 
      <Route path="/overview" element={<Overview />} /> 
      <Route path="/homestays" element={<Homestays />} /> 
      <Route path="/homestayListings" element={<HomestayListings />} /> 
      <Route path="/homestay/:id" element={<HomestayDetails />} />

      
        {/* Admin Protected Routes */}
        <Route 
          path="/admin/overview" 
          element={
            <AdminProtectedRoute>
              <Overview />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/homestays" 
          element={
            <AdminProtectedRoute>
              <Homestays />
            </AdminProtectedRoute>
          } 
        />


        {/* Host Protected Routes */}
        <Route 
          path="/Hosts/hostDashboard" 
          element={
            <HostProtectedRoute>
              <HostDashboard />
            </HostProtectedRoute>
          } 
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<HomePage />} />
    </Routes>
  );
}

export default App;