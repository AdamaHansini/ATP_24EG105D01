// backend/src/routes/wishlistRoutes.js
import express from 'express';
import { getWishlist, addWishlist, removeWishlist, moveToCart } from '../controllers/wishlistController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticateToken, requireRoles('customer'));

router.get('/', getWishlist);
router.post('/', addWishlist);
router.delete('/:productId', removeWishlist);
router.post('/move-to-cart', moveToCart);

export default router;
