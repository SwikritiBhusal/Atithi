
import axios from 'axios';
import Notification from "../models/notificationsModel.js";

// Check if we're in mock/test mode
export const checkPaymentMode = async (req, res) => {
  try {
    const isMockMode = process.env.NODE_ENV === 'development' || process.env.PAYMENT_TEST_MODE === 'true';
    
    return res.json({
      success: true,
      isMockMode
    });
  } catch (error) {
    return res.json({
      success: false,
      isMockMode: false
    });
  }
};

// Initiate Khalti Payment
export const initiateKhaltiPayment = async (req, res) => {
  try {
    console.log('=== KHALTI PAYMENT INITIATION ===');
    console.log('Request Body:', req.body);
    console.log('Khalti Secret Key Present:', !!process.env.KHALTI_SECRET_KEY);
    console.log('Frontend URL:', process.env.FRONTEND_URL);

    const {
      amount,           // Amount in paisa (NPR * 100)
      productIdentity,  // Unique identifier (like booking ID)
      productName,      // Product name
      productUrl,       // Product URL
      customerInfo      // Customer details
    } = req.body;

    // Validate required fields
    if (!amount || !productIdentity || !productName || !customerInfo) {
      console.error('Missing required fields');
      return res.json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if Khalti key is configured
    if (!process.env.KHALTI_SECRET_KEY) {
      console.error('KHALTI_SECRET_KEY not found in environment variables');
      return res.json({
        success: false,
        message: 'Khalti configuration missing'
      });
    }

    // Khalti payment initiation payload
    const payload = {
      return_url: `${process.env.FRONTEND_URL}/payment/verify`,
      website_url: process.env.FRONTEND_URL || 'http://localhost:5173',
      amount: amount,  // Amount in paisa (1 NPR = 100 paisa)
      purchase_order_id: productIdentity,
      purchase_order_name: productName,
      customer_info: {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone
      }
    };

    console.log('Khalti Payload:', payload);

    // Call Khalti API to initiate payment (Updated endpoint)
    const khaltiResponse = await axios.post(
      'https://a.khalti.com/api/v2/epayment/initiate/',
      payload,
      {
        headers: {
          'Authorization': `key ${process.env.KHALTI_SECRET_KEY}`,  // lowercase 'key'
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Khalti Response:', khaltiResponse.data);

    // Return payment URL and token
    return res.json({
      success: true,
      data: khaltiResponse.data
    });

  } catch (error) {
    console.error('=== KHALTI ERROR ===');
    console.error('Error Message:', error.message);
    console.error('Error Response:', error.response?.data);
    console.error('Error Status:', error.response?.status);
    
    return res.json({
      success: false,
      message: 'Payment initiation failed',
      error: error.response?.data || error.message
    });
  }
};

// Verify Khalti Payment
export const verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx, isMockPayment } = req.body;  // Payment index from Khalti callback

    if (!pidx) {
      return res.json({
        success: false,
        message: 'Payment index (pidx) is required'
      });
    }

    // Handle mock payment
    if (isMockPayment || pidx.startsWith('MOCK_')) {
      console.log('=== MOCK PAYMENT VERIFICATION ===');
      console.log('Mock pidx:', pidx);
      
      return res.json({
        success: true,
        message: 'Mock payment verified successfully',
        data: {
          pidx: pidx,
          transaction_id: `TXN_${pidx}`,
          amount: 0,
          status: 'Completed',
          isMockPayment: true
        }
      });
    }

    // Verify payment with Khalti
    const khaltiResponse = await axios.post(
      'https://a.khalti.com/api/v2/epayment/lookup/',
      { pidx },
      {
        headers: {
          'Authorization': `key ${process.env.KHALTI_SECRET_KEY}`,  // lowercase 'key'
          'Content-Type': 'application/json'
        }
      }
    );
    await Notification.create({
  userId: booking.userId,
  role: "tourist",
  title: "Booking Confirmed",
  message: `Your booking ${booking.bookingId} has been confirmed`
});

    const paymentData = khaltiResponse.data;

    // Check if payment is completed
    if (paymentData.status === 'Completed') {
      return res.json({
        success: true,
        message: 'Payment verified successfully',
        data: paymentData
      });
    } else {
      return res.json({
        success: false,
        message: 'Payment not completed',
        status: paymentData.status,
        data: paymentData
      });
    }

  } catch (error) {
    console.error('Khalti Verification Error:', error.response?.data || error.message);
    return res.json({
      success: false,
      message: 'Payment verification failed',
      error: error.response?.data || error.message
    });
  }
};