// backend/src/routes/orderRoutes.js
import express from 'express';
import { checkout, getOrders, getOrderById, updateStatus, cancel, requestReturn } from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

// Multi-vendor checkout reserves stock and writes orders in one MongoDB transaction.
router.post('/checkout', requireRoles('customer'), checkout);
router.get('/', requireRoles('customer', 'seller', 'admin'), getOrders);
router.get('/:id', requireRoles('customer', 'admin'), getOrderById);
router.patch('/:id/status', requireRoles('admin'), updateStatus);
router.post('/:id/cancel', requireRoles('customer', 'admin'), cancel);
router.post('/:id/return', requireRoles('customer'), requestReturn);

export default router;
