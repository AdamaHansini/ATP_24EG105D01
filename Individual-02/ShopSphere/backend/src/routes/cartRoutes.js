import express from 'express';
import {
  getCart,
  mergeGuestCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  validateCoupon,
} from '../controllers/cartController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(optionalAuth);

router.get('/', getCart);
router.post('/merge-guest', mergeGuestCart);
router.post('/items', addItemToCart);
router.patch('/items/:id', updateCartItem);
router.delete('/items/:id', removeCartItem);
router.post('/coupon/validate', validateCoupon);

export default router;
