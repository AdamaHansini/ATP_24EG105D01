// backend/src/routes/orderRoutes.js
import express from 'express';
import { checkout, getOrders, getOrderById, updateStatus, cancel } from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

// MANDATORY SIGNATURE FEATURE: Multi-vendor checkout with atomic rollback
router.post('/checkout', checkout);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateStatus);
router.post('/:id/cancel', cancel);

export default router;
