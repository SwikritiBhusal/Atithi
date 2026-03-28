import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader, CheckCircle, XCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import './PaymentVerify.css';

export default function PaymentVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const [message, setMessage] = useState('Verifying your payment...');
  const [bookingData, setBookingData] = useState(null);
  

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Get pidx from URL query params (sent by Khalti)
      const pidx = searchParams.get('pidx');
      const txnId = searchParams.get('transaction_id');
      const amount = searchParams.get('amount');
      const purchaseOrderId = searchParams.get('purchase_order_id');

      console.log('=== PAYMENT VERIFICATION ===');
      console.log('pidx:', pidx);
      console.log('transaction_id:', txnId);
      console.log('amount:', amount);
      console.log('purchase_order_id:', purchaseOrderId);

      if (!pidx) {
        setStatus('failed');
        setMessage('Payment verification failed - Missing payment information');
        return;
      }

      // Get booking data from sessionStorage
      const pendingBookingStr = sessionStorage.getItem('pendingBooking');
      if (!pendingBookingStr) {
        setStatus('failed');
        setMessage('Booking data not found');
        return;
      }

      const pendingBooking = JSON.parse(pendingBookingStr);
      console.log('Pending Booking Data:', pendingBooking);

      // Step 1: Verify payment with backend
      const verifyResponse = await fetch('http://localhost:5000/api/payment/khalti/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          pidx,
          isMockPayment: pidx.startsWith('MOCK_')
        })
      });

      const verifyResult = await verifyResponse.json();
      console.log('Verification Result:', verifyResult);

      if (!verifyResult.success) {
        setStatus('failed');
        setMessage(verifyResult.message || 'Payment verification failed');
        return;
      }

      // Step 2: Create booking in database
      const bookingPayload = {
        bookingId: pendingBooking.bookingId,
        userId: pendingBooking.user.id,
        homestayId: pendingBooking.homestay._id,
        hostId: pendingBooking.homestay.hostUserId,
        checkIn: pendingBooking.bookingData.checkIn,
        checkOut: pendingBooking.bookingData.checkOut,
        nights: pendingBooking.nights,
        rooms: pendingBooking.bookingData.rooms,
        guests: pendingBooking.bookingData.guests,
        totalPrice: pendingBooking.totalPrice,
        advancePayment: pendingBooking.advancePayment,
        remainingPayment: pendingBooking.remainingPayment,
        paymentOption: pendingBooking.paymentOption,
        khaltiTransactionId: verifyResult.data.transaction_id,
        khaltiPidx: pidx,
        guestName: pendingBooking.user.username,
        guestEmail: pendingBooking.user.email,
        guestPhone: pendingBooking.user.contactNumber || 'N/A',
        homestayName: pendingBooking.homestay.homestayName,
        homestayLocation: `${pendingBooking.homestay.municipality}, ${pendingBooking.homestay.district}`
      };

      console.log('Creating Booking:', bookingPayload);

      const bookingResponse = await fetch('http://localhost:5000/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(bookingPayload)
      });

      const bookingResult = await bookingResponse.json();
      console.log('Booking Result:', bookingResult);

      if (bookingResult.success) {
        setStatus('success');
        setMessage('Payment successful! Your booking has been created.');
        setBookingData(bookingResult.booking);

       

        // Clear pending booking from sessionStorage
        sessionStorage.removeItem('pendingBooking');

        // Redirect to success page after 2 seconds
        setTimeout(() => {
          navigate('/payment/success', {
            state: {
              booking: bookingResult.booking,
              paymentData: verifyResult.data
            }
          });
        }, 2000);
      } else {
        setStatus('failed');
        setMessage('Payment verified but booking creation failed. Please contact support.');
      }

    } catch (error) {
      console.error('Verification Error:', error);
      setStatus('failed');
      setMessage('An error occurred during payment verification');
    }
  };

  return (
    <>
      <Navbar />
      <div className="payment-verify-page">
        <div className="pv-container">
          {status === 'verifying' && (
            <div className="pv-card verifying">
              <div className="pv-icon">
                <Loader size={64} className="pv-spinner" />
              </div>
              <h1 className="pv-title">Verifying Payment</h1>
              <p className="pv-message">{message}</p>
              <p className="pv-note">Please wait, do not close this page...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="pv-card success">
              <div className="pv-icon">
                <CheckCircle size={64} />
              </div>
              <h1 className="pv-title">Payment Successful!</h1>
              <p className="pv-message">{message}</p>
              <p className="pv-note">Redirecting to confirmation page...</p>
            </div>
          )}

          {status === 'failed' && (
            <div className="pv-card failed">
              <div className="pv-icon">
                <XCircle size={64} />
              </div>
              <h1 className="pv-title">Payment Failed</h1>
              <p className="pv-message">{message}</p>
              <button 
                className="pv-back-btn"
                onClick={() => navigate('/homestayListings')}
              >
                Back to Homestays
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}