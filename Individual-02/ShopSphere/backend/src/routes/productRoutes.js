import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getProductReviews,
  addProductReview,
  recordProductView,
  getRecentlyViewed,
} from '../controllers/productController.js';

import { authenticateToken, optionalAuth } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(optionalAuth);

router.get('/categories/list', getCategories);
router.get('/history/recently-viewed', getRecentlyViewed);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/:id/reviews', getProductReviews);
router.post('/:id/view', recordProductView);

// Protected actions
router.post('/', authenticateToken, requireRoles('seller', 'admin'), createProduct);
router.patch('/:id', authenticateToken, requireRoles('seller', 'admin'), updateProduct);
router.delete('/:id', authenticateToken, requireRoles('seller', 'admin'), deleteProduct);
router.post('/:id/reviews', authenticateToken, requireRoles('customer'), addProductReview);

export default router;
