
import express from 'express';
import { getSmartRecommendations } from '../Controller/recommendationController.js';

const router = express.Router();

// POST: Get smart AI recommendations
router.post('/smart-match', getSmartRecommendations);

export default router;