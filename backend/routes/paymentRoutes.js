
// import express from 'express';
// import { initiateKhaltiPayment, verifyKhaltiPayment } from '../Controller/paymentController.js';

// const router = express.Router();

// // POST: Initiate Khalti Payment
// router.post('/khalti/initiate', initiateKhaltiPayment);

// // POST: Verify Khalti Payment
// router.post('/khalti/verify', verifyKhaltiPayment);

// export default router;

import express from 'express';
import { initiateKhaltiPayment, verifyKhaltiPayment, checkPaymentMode } from '../Controller/paymentController.js';

const router = express.Router();

// GET: Check if we're in mock/test mode
router.get('/check-mode', checkPaymentMode);

// POST: Initiate Khalti Payment
router.post('/khalti/initiate', initiateKhaltiPayment);

// POST: Verify Khalti Payment
router.post('/khalti/verify', verifyKhaltiPayment);

export default router;






























