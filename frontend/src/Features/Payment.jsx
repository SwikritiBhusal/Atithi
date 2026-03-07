import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Lock, 
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import Navbar from '../components/Navbar';
import './Payment.css';

export default function KhaltiPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMockMode, setIsMockMode] = useState(false);

  // Get data from BookingConfirmation page
  const {
    homestay,
    bookingData,
    totalPrice,
    advancePayment,
    remainingPayment,
    paymentOption,
    nights,
    user
  } = location.state || {};

  useEffect(() => {
    // Check if all required data exists
    if (!homestay || !bookingData || !user) {
      alert('Payment data missing!');
      navigate('/homestayListings');
    }

    // Check if we're in development mode
    checkMockMode();
  }, [homestay, bookingData, user, navigate]);

  const checkMockMode = async () => {
    try {
      // Check if backend is in test mode
      const response = await fetch('http://localhost:5000/api/payment/check-mode', {
        credentials: 'include'
      });
      const result = await response.json();
      setIsMockMode(result.isMockMode);
    } catch (error) {
      console.log('Could not check mode, assuming production');
      setIsMockMode(false);
    }
  };

  // Mock payment for testing
  const handleMockPayment = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('=== MOCK PAYMENT ===');
      
      const bookingId = `BK${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      // Simulate payment success
      const mockPaymentData = {
        pidx: `MOCK_${Date.now()}`,
        transaction_id: `TXN_MOCK_${Date.now()}`,
        amount: advancePayment * 100,
        status: 'Completed'
      };

      // Store booking data with mock payment info
      sessionStorage.setItem('pendingBooking', JSON.stringify({
        bookingId,
        homestay,
        bookingData,
        totalPrice,
        advancePayment,
        remainingPayment,
        paymentOption,
        nights,
        user,
        pidx: mockPaymentData.pidx,
        isMockPayment: true
      }));

      console.log('Mock payment created, redirecting to verify...');

      // Simulate Khalti redirect with mock data
      setTimeout(() => {
        navigate(`/payment/verify?pidx=${mockPaymentData.pidx}&transaction_id=${mockPaymentData.transaction_id}&amount=${mockPaymentData.amount}&purchase_order_id=${bookingId}&status=Completed`);
      }, 1000);

    } catch (error) {
      console.error('Mock Payment Error:', error);
      setError('Mock payment failed');
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('=== INITIATING PAYMENT ===');
      
      // Generate unique booking ID with timestamp + random number
      const bookingId = `BK${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      // Amount in paisa (Khalti requires amount in paisa, 1 NPR = 100 paisa)
      const amountInPaisa = advancePayment * 100;

      console.log('Booking ID:', bookingId);
      console.log('Amount (NPR):', advancePayment);
      console.log('Amount (Paisa):', amountInPaisa);

      // Prepare payment data
      const paymentData = {
        amount: amountInPaisa,
        productIdentity: bookingId,
        productName: `Booking: ${homestay.homestayName}`,
        productUrl: window.location.origin,
        customerInfo: {
          name: user.username,
          email: user.email,
          phone: user.contactNumber || '9800000000'
        }
      };

      console.log('Payment Data:', paymentData);

      // Call backend to initiate payment
      const response = await fetch('http://localhost:5000/api/payment/khalti/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(paymentData)
      });

      console.log('Response Status:', response.status);
      
      const result = await response.json();
      console.log('Response Data:', result);

      if (result.success) {
        console.log('Payment URL:', result.data.payment_url);
        console.log('Payment Index (pidx):', result.data.pidx);
        
        // Store booking data in sessionStorage for later use
        sessionStorage.setItem('pendingBooking', JSON.stringify({
          bookingId,
          homestay,
          bookingData,
          totalPrice,
          advancePayment,
          remainingPayment,
          paymentOption,
          nights,
          user,
          pidx: result.data.pidx  // Khalti payment index
        }));

        // Redirect to Khalti payment page
        console.log('Redirecting to Khalti...');
        window.location.href = result.data.payment_url;
      } else {
        console.error('Payment initiation failed:', result);
        setError(result.message || 'Failed to initiate payment. Please check console for details.');
        
        // Show detailed error if available
        if (result.error) {
          console.error('Detailed Error:', result.error);
          setError(`${result.message}: ${JSON.stringify(result.error)}`);
        }
      }

    } catch (error) {
      console.error('Payment Error:', error);
      setError(`Failed to initiate payment: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/homestay/${homestay._id}/confirm`, {
      state: {
        homestay,
        bookingData,
        totalPrice,
        nights
      }
    });
  };

  if (!homestay) {
    return (
      <>
        <Navbar />
        <div className="kp-loading">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="khalti-payment-page">
        <div className="kp-container">
          {/* Back Button */}
          <button className="kp-back-btn" onClick={handleBack}>
            <ArrowLeft size={20} />
            Back to Confirmation
          </button>

          {/* Header */}
          <div className="kp-header">
            <div className="kp-lock-icon">
              <Lock size={32} />
            </div>
            <h1 className="kp-title">Secure Payment</h1>
            <p className="kp-subtitle">Complete your booking payment via Khalti</p>
          </div>

          {/* Payment Card */}
          <div className="kp-card">
            {/* Booking Summary */}
            <div className="kp-section">
              <h3 className="kp-section-title">Booking Summary</h3>
              <div className="kp-summary-grid">
                <div className="kp-summary-item">
                  <span className="kp-label">Homestay</span>
                  <span className="kp-value">{homestay.homestayName}</span>
                </div>
                <div className="kp-summary-item">
                  <span className="kp-label">Check-in</span>
                  <span className="kp-value">
                    {new Date(bookingData.checkIn).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="kp-summary-item">
                  <span className="kp-label">Duration</span>
                  <span className="kp-value">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                </div>
                <div className="kp-summary-item">
                  <span className="kp-label">Rooms</span>
                  <span className="kp-value">{bookingData.rooms} {bookingData.rooms === 1 ? 'Room' : 'Rooms'}</span>
                </div>
              </div>
            </div>

            <div className="kp-divider"></div>

            {/* Payment Details */}
            <div className="kp-section">
              <h3 className="kp-section-title">Payment Details</h3>
              
              <div className="kp-payment-breakdown">
                <div className="kp-payment-row">
                  <span>Total Booking Amount</span>
                  <span>NPR {totalPrice.toLocaleString()}</span>
                </div>

                {paymentOption === 'advance' ? (
                  <>
                    <div className="kp-payment-row highlight">
                      <span>Pay Now (20%)</span>
                      <span className="kp-amount-highlight">NPR {advancePayment.toLocaleString()}</span>
                    </div>
                    <div className="kp-payment-row muted">
                      <span>Pay at Property (80%)</span>
                      <span>NPR {remainingPayment.toLocaleString()}</span>
                    </div>
                  </>
                ) : (
                  <div className="kp-payment-row highlight">
                    <span>Full Payment (100%)</span>
                    <span className="kp-amount-highlight">NPR {advancePayment.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="kp-total">
                <span>Amount to Pay Now</span>
                <span className="kp-total-amount">NPR {advancePayment.toLocaleString()}</span>
              </div>
            </div>

            <div className="kp-divider"></div>

            {/* Payment Method */}
            <div className="kp-section">
              <h3 className="kp-section-title">Payment Method</h3>
              <div className="kp-payment-method">
                <img 
                  src="https://web.khalti.com/static/img/logo1.png" 
                  alt="Khalti" 
                  className="kp-khalti-logo"
                />
                <div className="kp-method-info">
                  <span className="kp-method-name">Khalti Digital Wallet</span>
                  <span className="kp-method-desc">Secure payment gateway</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="kp-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Mock Mode Notice */}
            {isMockMode && (
              <div className="kp-mock-notice">
                <AlertCircle size={18} />
                <div>
                  <strong>Test Mode Active</strong>
                  <p>You can test the booking flow without real payment</p>
                </div>
              </div>
            )}

            {/* Payment Buttons */}
            {isMockMode ? (
              <div className="kp-button-group">
                <button 
                  className="kp-mock-btn" 
                  onClick={handleMockPayment}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader size={20} className="kp-spinner" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Complete Test Booking (Mock)
                    </>
                  )}
                </button>
                <button 
                  className="kp-pay-btn" 
                  onClick={initiatePayment}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader size={20} className="kp-spinner" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock size={20} />
                      Pay NPR {advancePayment.toLocaleString()} via Khalti
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button 
                className="kp-pay-btn" 
                onClick={initiatePayment}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader size={20} className="kp-spinner" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    Pay NPR {advancePayment.toLocaleString()} via Khalti
                  </>
                )}
              </button>
            )}

            {/* Security Note */}
            <div className="kp-security-note">
              <CheckCircle size={16} />
              <span>Your payment is secured by Khalti's 256-bit encryption</span>
            </div>
          </div>

          {/* Info Cards */}
          <div className="kp-info-cards">
            <div className="kp-info-card">
              <CheckCircle size={20} />
              <div>
                <h4>Secure Payment</h4>
                <p>Your payment information is encrypted and secure</p>
              </div>
            </div>
            <div className="kp-info-card">
              <CheckCircle size={20} />
              <div>
                <h4>Instant Confirmation</h4>
                <p>Receive booking confirmation immediately after payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}