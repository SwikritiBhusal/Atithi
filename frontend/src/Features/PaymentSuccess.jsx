import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Calendar, 
  Home, 
  Users, 
  MapPin,
  Clock,
  CreditCard,
  AlertCircle,
  Download
} from 'lucide-react';
import Navbar from '../components/Navbar';
import './PaymentSuccess.css';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const { booking, paymentData } = location.state || {};

  if (!booking) {
    return (
      <>
        <Navbar />
        <div className="ps-loading">No booking data found</div>
      </>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Navbar />
      <div className="payment-success-page">
        <div className="ps-container">
          {/* Success Header */}
          <div className="ps-header">
            <div className="ps-success-icon">
              <CheckCircle size={64} />
            </div>
            <h1 className="ps-title">Booking Confirmed!</h1>
            <p className="ps-subtitle">Your payment was successful</p>
          </div>

          {/* Booking Reference */}
          <div className="ps-reference">
            <span className="ps-ref-label">Booking Reference</span>
            <span className="ps-ref-number">{booking.bookingId}</span>
          </div>

          {/* Status Card */}
          <div className="ps-status-card">
            <AlertCircle size={20} />
            <div>
              <h3>Pending Host Approval</h3>
              <p>Your booking is awaiting confirmation from the host. You'll receive an email once approved.</p>
            </div>
          </div>

          {/* Booking Details */}
          <div className="ps-card">
            <h2 className="ps-card-title">Booking Details</h2>
            
            <div className="ps-detail-row">
              <Home size={20} />
              <div className="ps-detail-content">
                <span className="ps-detail-label">Homestay</span>
                <span className="ps-detail-value">{booking.homestayName}</span>
              </div>
            </div>

            <div className="ps-detail-row">
              <MapPin size={20} />
              <div className="ps-detail-content">
                <span className="ps-detail-label">Location</span>
                <span className="ps-detail-value">{booking.homestayLocation}</span>
              </div>
            </div>

            <div className="ps-divider"></div>

            <div className="ps-detail-row">
              <Calendar size={20} />
              <div className="ps-detail-content">
                <span className="ps-detail-label">Check-in</span>
                <span className="ps-detail-value">{formatDate(booking.checkIn)}</span>
              </div>
            </div>

            <div className="ps-detail-row">
              <Calendar size={20} />
              <div className="ps-detail-content">
                <span className="ps-detail-label">Check-out</span>
                <span className="ps-detail-value">{formatDate(booking.checkOut)}</span>
              </div>
            </div>

            <div className="ps-detail-row">
              <Clock size={20} />
              <div className="ps-detail-content">
                <span className="ps-detail-label">Duration</span>
                <span className="ps-detail-value">{booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'}</span>
              </div>
            </div>

            <div className="ps-divider"></div>

            <div className="ps-detail-row">
              <Home size={20} />
              <div className="ps-detail-content">
                <span className="ps-detail-label">Rooms</span>
                <span className="ps-detail-value">{booking.rooms} {booking.rooms === 1 ? 'Room' : 'Rooms'}</span>
              </div>
            </div>

            <div className="ps-detail-row">
              <Users size={20} />
              <div className="ps-detail-content">
                <span className="ps-detail-label">Guests</span>
                <span className="ps-detail-value">{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="ps-card">
            <h2 className="ps-card-title">Payment Summary</h2>
            
            <div className="ps-payment-row">
              <span>Total Amount</span>
              <span>NPR {booking.totalPrice.toLocaleString()}</span>
            </div>

            <div className="ps-payment-row highlight">
              <span>
                <CreditCard size={16} />
                Paid Now {booking.paymentOption === 'full' ? '(Full Payment)' : '(Advance 20%)'}
              </span>
              <span className="ps-amount-paid">NPR {booking.advancePayment.toLocaleString()}</span>
            </div>

            {booking.remainingPayment > 0 && (
              <div className="ps-payment-row remaining">
                <span>Remaining Balance (Pay at property)</span>
                <span>NPR {booking.remainingPayment.toLocaleString()}</span>
              </div>
            )}

            <div className="ps-divider"></div>

            <div className="ps-transaction-info">
              <span className="ps-trans-label">Transaction ID</span>
              <span className="ps-trans-id">{booking.khaltiTransactionId}</span>
            </div>

            <div className="ps-transaction-info">
              <span className="ps-trans-label">Payment Date</span>
              <span className="ps-trans-date">{formatDateTime(booking.paymentDate)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="ps-actions">
            <button className="ps-secondary-btn" onClick={() => navigate('/homestayListings')}>
              Browse More Homestays
            </button>
            <button className="ps-primary-btn" onClick={() => navigate('/my-bookings')}>
              View My Bookings
            </button>
          </div>

          {/* Email Confirmation */}
          <div className="ps-email-note">
            <CheckCircle size={16} />
            <span>A confirmation email has been sent to {booking.guestEmail}</span>
          </div>
        </div>
      </div>
    </>
  );
}