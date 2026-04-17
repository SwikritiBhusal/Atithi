import express from 'express';
import userAuth from '../Middleware/auth.middleware.js';
import roleAuth from '../Middleware/roleAuth.js';
import { getAdminOverviewAnalytics } from '../Controller/adminAnalyticsController.js';

const router = express.Router();

router.get('/overview', userAuth, roleAuth('admin'), getAdminOverviewAnalytics);

export default router;
