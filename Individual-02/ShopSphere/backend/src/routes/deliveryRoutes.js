import express from 'express';
import {
  getDeliveries,
  getActiveDelivery,
  getDeliveryById,
  updateDeliveryStatus,
  addTrackingUpdate,
} from '../controllers/deliveryController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticateToken, requireRoles('delivery', 'admin'));

router.get('/', getDeliveries);
router.get('/active', getActiveDelivery);
router.get('/:id', getDeliveryById);
router.patch('/:id/status', updateDeliveryStatus);
router.post('/:id/tracking', addTrackingUpdate);

export default router;