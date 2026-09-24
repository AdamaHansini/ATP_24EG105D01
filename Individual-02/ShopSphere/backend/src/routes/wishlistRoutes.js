// backend/src/routes/wishlistRoutes.js
import express from 'express';
import { getWishlist, addWishlist, removeWishlist, moveToCart } from '../controllers/wishlistController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getWishlist);
router.post('/', addWishlist);
router.delete('/:productId', removeWishlist);
router.post('/move-to-cart', moveToCart);

export default router;
