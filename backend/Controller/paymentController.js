
import axios from 'axios';
import Notification from "../models/notificationsModel.js";

// Initiate Khalti Payment
export const initiateKhaltiPayment = async (req, res) => {
  try {
    console.log('=== KHALTI PAYMENT INITIATION ===');

    const {
      amount,
      productIdentity,
      productName,
      productUrl,
      customerInfo
    } = req.body;

    if (!amount || !productIdentity || !productName || !customerInfo) {
      return res.json({ success: false, message: 'Missing required fields' });
    }

    if (!process.env.KHALTI_SECRET_KEY) {
      return res.json({ success: false, message: 'Khalti configuration missing' });
    }

    const payload = {
      return_url: `${process.env.FRONTEND_URL}/payment/verify`,
      website_url: process.env.FRONTEND_URL || 'http://localhost:5173',
      amount: amount,
      purchase_order_id: productIdentity,
      purchase_order_name: productName,
      customer_info: {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone
      }
    };

    console.log('Khalti Payload:', payload);
    console.log('Authorization Header:', `Key ${process.env.KHALTI_SECRET_KEY}`);

    const khaltiResponse = await axios.post(
      'https://a.khalti.com/api/v2/epayment/initiate/',
      payload,
      {
        headers: {
          'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Khalti Response:', khaltiResponse.data);

    return res.json({ success: true, data: khaltiResponse.data });

  } catch (error) {
    console.error('Khalti Error:', error.response?.data || error.message);
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
    const { pidx } = req.body;

    if (!pidx) {
      return res.json({ success: false, message: 'Payment index (pidx) is required' });
    }

    const khaltiResponse = await axios.post(
      'https://a.khalti.com/api/v2/epayment/lookup/',
      { pidx },
      {
        headers: {
          'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const paymentData = khaltiResponse.data;
    console.log('Khalti Verification Response:', paymentData);

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