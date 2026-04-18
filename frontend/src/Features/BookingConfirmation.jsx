import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Home, 
  Calendar, 
  Users, 
  MapPin, 
  Clock,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAppToast } from '../components/toast';
import './BookingConfirmation.css';

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useAppToast();
  const [user, setUser] = useState(null);
  const [paymentOption, setPaymentOption] = useState('full'); // 'advance' or 'full'

  // Get data from navigation state
  const { homestay, bookingData, totalPrice, nights } = location.state || {};

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.warning('Login Required', 'Please login to complete booking');
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userStr));

    // Check if booking data exists
    if (!homestay || !bookingData) {
      toast.error('Missing Booking Data', 'Booking data not found.');
      navigate('/homestayListings');
    }
  }, [navigate, homestay, bookingData, toast]);

  if (!homestay || !bookingData) {
    return (
      <>
        <Navbar />
        <div className="bc-loading">Loading...</div>
      </>
    );
  }

  // Calculate payments based on selected option
  const advancePayment = paymentOption === 'advance' 
    ? Math.round(totalPrice * 0.2)  // 20%
    : totalPrice;                    // 100%
  
  const remainingPayment = paymentOption === 'advance'
    ? totalPrice - Math.round(totalPrice * 0.2)  // 80%
    : 0;                                          // Nothing

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  const handleProceedToPayment = () => {
    // Navigate to payment page with booking details
    navigate('/payment', {
      state: {
        homestay,
        bookingData,
        totalPrice,
        advancePayment,
        remainingPayment,
        paymentOption,      // ← Pass the selected option
        nights,
        user
      }
    });
  };

  const handleCancel = () => {
    navigate(`/homestay/${homestay._id}`);
  };

  return (
    <>
      <Navbar />
      <div className="booking-confirmation-page">
        <div className="bc-container">
          {/* Back Button */}
          <button className="bc-back-btn" onClick={handleCancel}>
            <ArrowLeft size={20} />
            Back to Homestay
          </button>

          {/* Header */}
          <div className="bc-header">
            <h1 className="bc-title">Confirm Your Booking</h1>
            <p className="bc-subtitle">Review your booking details before proceeding to payment</p>
          </div>

          <div className="bc-layout">
            {/* Left Side - Booking Details */}
            <div className="bc-left">
              {/* Homestay Card */}
              <div className="bc-section bc-homestay-card">
                <div className="bc-homestay-image">
                  {homestay.homestayPhotos && homestay.homestayPhotos.length > 0 ? (
                    <img 
                      src={homestay.homestayPhotos[0].url} 
                      alt={homestay.homestayName}
                    />
                  ) : (
                    <div className="bc-no-image">
                      <Home size={40} />
                    </div>
                  )}
                </div>
                <div className="bc-homestay-info">
                  <h2 className="bc-homestay-name">{homestay.homestayName}</h2>
                  <div className="bc-homestay-location">
                    <MapPin size={16} />
                    <span>{homestay.municipality}, {homestay.district}, {homestay.province}</span>
                  </div>
                  <div className="bc-homestay-host">
                    <span>Hosted by {homestay.ownerName}</span>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="bc-section">
                <h3 className="bc-section-title">
                  <Calendar size={20} />
                  Booking Details
                </h3>
                <div className="bc-details-grid">
                  <div className="bc-detail-item">
                    <span className="bc-detail-label">Check-in</span>
                    <span className="bc-detail-value">
                      <Clock size={16} />
                      {formatDate(bookingData.checkIn)}
                    </span>
                    <span className="bc-detail-time">{homestay.checkIn || '2:00 PM'}</span>
                  </div>

                  <div className="bc-detail-item">
                    <span className="bc-detail-label">Check-out</span>
                    <span className="bc-detail-value">
                      <Clock size={16} />
                      {formatDate(bookingData.checkOut)}
                    </span>
                    <span className="bc-detail-time">{homestay.checkOut || '11:00 AM'}</span>
                  </div>

                  <div className="bc-detail-item">
                    <span className="bc-detail-label">Duration</span>
                    <span className="bc-detail-value">
                      <Calendar size={16} />
                      {nights} {nights === 1 ? 'Night' : 'Nights'}
                    </span>
                  </div>

                  <div className="bc-detail-item">
                    <span className="bc-detail-label">Rooms</span>
                    <span className="bc-detail-value">
                      <Home size={16} />
                      {bookingData.rooms} {bookingData.rooms === 1 ? 'Room' : 'Rooms'}
                    </span>
                  </div>

                  <div className="bc-detail-item">
                    <span className="bc-detail-label">Guests</span>
                    <span className="bc-detail-value">
                      <Users size={16} />
                      {bookingData.guests} {bookingData.guests === 1 ? 'Guest' : 'Guests'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Important Information */}
              <div className="bc-section bc-info-section">
                <div className="bc-info-card">
                  <div className="bc-info-icon">
                    <Info size={20} />
                  </div>
                  <div className="bc-info-content">
                    <h4>Payment Process</h4>
                    <ul>
                      <li>Pay 20% advance now to confirm your booking</li>
                      <li>Remaining 80% can be paid at the property</li>
                      <li>Host will review and approve your booking within 24 hours</li>
                      <li>You'll receive confirmation via email once approved</li>
                    </ul>
                  </div>
                </div>

                <div className="bc-info-card warning">
                  <div className="bc-info-icon">
                    <AlertCircle size={20} />
                  </div>
                  <div className="bc-info-content">
                    <h4>Cancellation Policy: {homestay.cancellationPolicy}</h4>
                    {homestay.cancellationPolicy === 'flexible' && (
                      <p>Free cancellation up to 7 days before check-in. 50% refund if cancelled 3-7 days before.</p>
                    )}
                    {homestay.cancellationPolicy === 'moderate' && (
                      <p>Free cancellation up to 14 days before check-in. 50% refund if cancelled 7-14 days before.</p>
                    )}
                    {homestay.cancellationPolicy === 'strict' && (
                      <p>50% refund only if cancelled more than 30 days before check-in.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Price Summary */}
            <div className="bc-right">
              <div className="bc-price-card">
                <h3 className="bc-price-title">Price Summary</h3>

                {/* Price Breakdown */}
                <div className="bc-price-breakdown">
                  <div className="bc-price-row">
                    <span className="bc-price-label">
                      NPR {homestay.price?.toLocaleString()} × {bookingData.rooms} {bookingData.rooms === 1 ? 'room' : 'rooms'} × {nights} {nights === 1 ? 'night' : 'nights'}
                    </span>
                    <span className="bc-price-value">NPR {totalPrice.toLocaleString()}</span>
                  </div>

                  <div className="bc-divider"></div>

                  <div className="bc-price-row total">
                    <span className="bc-price-label">Total Amount</span>
                    <span className="bc-price-value">NPR {totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Option Selection */}
                <div className="bc-payment-options">
                  <h4>Select Payment Method</h4>
                  
                  <label className={`bc-payment-option ${paymentOption === 'full' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentOption"
                      value="full"
                      checked={paymentOption === 'full'}
                      onChange={(e) => setPaymentOption(e.target.value)}
                    />
                    <div className="bc-option-content">
                      <div className="bc-option-header">
                        <span className="bc-option-title">Full Payment</span>
                        <span className="bc-option-badge recommended">Recommended</span>
                      </div>
                      <p className="bc-option-price">Pay NPR {totalPrice.toLocaleString()} now</p>
                      <p className="bc-option-desc">✓ Nothing to pay at property</p>
                      <p className="bc-option-desc">✓ Hassle-free experience</p>
                      <p className="bc-option-desc">✓ Most popular choice</p>
                    </div>
                  </label>

                  <label className={`bc-payment-option ${paymentOption === 'advance' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentOption"
                      value="advance"
                      checked={paymentOption === 'advance'}
                      onChange={(e) => setPaymentOption(e.target.value)}
                    />
                    <div className="bc-option-content">
                      <div className="bc-option-header">
                        <span className="bc-option-title">Partial Payment</span>
                        <span className="bc-option-badge budget">Budget Friendly</span>
                      </div>
                      <p className="bc-option-price">Pay NPR {Math.round(totalPrice * 0.2).toLocaleString()} now (20%)</p>
                      <p className="bc-option-desc">• NPR {(totalPrice - Math.round(totalPrice * 0.2)).toLocaleString()} due at property</p>
                      <p className="bc-option-desc">• Pay remaining 80% on arrival</p>
                    </div>
                  </label>
                </div>

                {/* Payment Split - Updated to show based on selection */}
                <div className="bc-payment-split">
                  <h4>Payment Breakdown</h4>
                  
                  {paymentOption === 'full' ? (
                    <div className="bc-payment-item advance">
                      <div className="bc-payment-header">
                        <span className="bc-payment-label">
                          <CheckCircle size={18} />
                          Full Payment (100%)
                        </span>
                        <span className="bc-payment-amount">NPR {totalPrice.toLocaleString()}</span>
                      </div>
                      <p className="bc-payment-note">Pay now via Khalti - No payment at property</p>
                    </div>
                  ) : (
                    <>
                      <div className="bc-payment-item advance">
                        <div className="bc-payment-header">
                          <span className="bc-payment-label">
                            <CheckCircle size={18} />
                            Advance Payment (20%)
                          </span>
                          <span className="bc-payment-amount">NPR {advancePayment.toLocaleString()}</span>
                        </div>
                        <p className="bc-payment-note">Pay now via Khalti</p>
                      </div>

                      <div className="bc-payment-item remaining">
                        <div className="bc-payment-header">
                          <span className="bc-payment-label">
                            <Clock size={18} />
                            Remaining Balance (80%)
                          </span>
                          <span className="bc-payment-amount">NPR {remainingPayment.toLocaleString()}</span>
                        </div>
                        <p className="bc-payment-note">Pay at the property</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="bc-actions">
                  <button className="bc-cancel-btn" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button className="bc-proceed-btn" onClick={handleProceedToPayment}>
                    Proceed to Payment
                    <span className="bc-proceed-amount">NPR {advancePayment.toLocaleString()}</span>
                  </button>
                </div>

                {/* Security Note */}
                <div className="bc-security-note">
                  <CheckCircle size={14} />
                  <span>Secure payment via Khalti</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
