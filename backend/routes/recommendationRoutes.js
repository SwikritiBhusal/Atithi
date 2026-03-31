import express from 'express';
import { 
  getSmartRecommendations,
  getRecommendationHistory,
  getRecommendationById,
  toggleSaveRecommendation,
  deleteRecommendation
} from '../Controller/recommendationController.js';
import userAuth  from '../Middleware/auth.middleware.js';

const router = express.Router();

// Get smart recommendations (with optional auth to save history)
router.post('/smart-match', userAuth, getSmartRecommendations);

//  History management routes
router.get('/history', userAuth, getRecommendationHistory);
router.get('/history/:historyId', userAuth, getRecommendationById);
router.put('/history/:historyId/toggle-save', userAuth, toggleSaveRecommendation);
router.delete('/history/:historyId', userAuth, deleteRecommendation);

export default router;