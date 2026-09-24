// backend/src/routes/sellerRoutes.js
import express from 'express';
import {
  getSellerDashboard,
  getSellerProducts,
  getSellerOrders,
  getSellerOrderById,
  updateSellerOrderStatus,
  getSellerSettlements,
  updateStore,
} from '../controllers/sellerController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Strict Authentication and Seller Role Requirement
router.use(authenticateToken, requireRoles('seller'));

router.get('/dashboard', getSellerDashboard);
router.get('/products', getSellerProducts);
router.get('/orders', getSellerOrders);
router.get('/orders/:id', getSellerOrderById);
router.patch('/orders/:id/status', updateSellerOrderStatus);
router.get('/settlements', getSellerSettlements);
router.patch('/store', updateStore);

export default router;
