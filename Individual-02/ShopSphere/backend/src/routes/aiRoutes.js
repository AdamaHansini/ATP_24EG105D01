// backend/src/routes/aiRoutes.js
import express from 'express';
import { predictProduct, generateDescription, generateTags, getRecommendations } from '../controllers/aiController.js';

import { authenticateToken, optionalAuth } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// AI generation features (Seller)
router.post('/predict-product', authenticateToken, requireRoles('seller', 'admin'), predictProduct);
router.post('/generate-description', authenticateToken, requireRoles('seller', 'admin'), generateDescription);
router.post('/generate-tags', authenticateToken, requireRoles('seller', 'admin'), generateTags);
router.get('/recommendations', optionalAuth, getRecommendations);

export default router;
