// backend/src/routes/aiRoutes.js
import express from 'express';
import { predictProduct, generateDescription, generateTags, getRecommendations } from '../controllers/aiController.js';

import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// AI generation features (Seller)
router.post('/predict-product', authenticateToken, predictProduct);
router.post('/generate-description', authenticateToken, generateDescription);
router.post('/generate-tags', authenticateToken, generateTags);
router.get('/recommendations', getRecommendations);

export default router;
