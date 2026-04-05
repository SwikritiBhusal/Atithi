
import express from 'express';
import { initiateKhaltiPayment, verifyKhaltiPayment } from '../Controller/paymentController.js';

const router = express.Router();

// POST: Initiate Khalti Payment
router.post('/khalti/initiate', initiateKhaltiPayment);

// POST: Verify Khalti Payment
router.post('/khalti/verify', verifyKhaltiPayment);

export default router;





























