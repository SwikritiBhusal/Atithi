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
import AdminDashboard from './Features/Admin/overview';
// import Homestays from './Features/Admin/homestays';
import HomestayListings from './Features/homestayListings';
import HomestayDetails from './Features/homestayDetails';
import BookingConfirmation from './Features/BookingConfirmation';
import HostDashboard from './Features/Hosts/hostDashboard';
import MyProfile from './Features/MyProfile';
import AdminProfile from './Features/Admin/AdminProfile';
import Payment from './Features/Payment';
import PaymentVerify from './Features/PaymentVerify';
import PaymentSuccess from './Features/Paymentsuccess';
import UserBookings from './Features/userBooking';
// Protected Routes
import { AdminProtectedRoute, HostProtectedRoute } from './components/ProtectedRoute';
import RecommendationResults from './Features/RecommendationResult';
import MyRecommendations  from './Features/myRecommendation';

import Favorites from './Features/Favorites';

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
       <Route path="/MyProfile" element={<MyProfile />} />
       <Route path="/AdminProfile" element={<AdminProfile />} />
       <Route path="/payment" element={<Payment />} />
       <Route path="/payment/verify" element={<PaymentVerify />} />
       <Route path="/payment/success" element={<PaymentSuccess />} />
       <Route path="/recommendations/results" element={<RecommendationResults />} />
       <Route path="/my-recommendations" element={<MyRecommendations />} />
       <Route path="/favorites" element={<Favorites />} />

      {/* <Route path="/overview" element={<AdminDashboard />} /> 
      <Route path="/homestays" element={<Homestays />} />  */}
      <Route path="/homestayListings" element={<HomestayListings />} /> 
      <Route path="/homestay/:id" element={<HomestayDetails />} />
      <Route path="/homestay/:id/confirm" element={<BookingConfirmation />} />
      <Route path="/my-bookings" element={<UserBookings />} />

      
        {/* Admin Protected Routes */}
        <Route 
          path="/admin/overview" 
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/homestays" 
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
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