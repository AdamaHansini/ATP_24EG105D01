// backend/src/routes/adminRoutes.js
import express from 'express';
import {
  getAdminDashboard,
  getUsers,
  toggleUserSuspension,
  getSellers,
  updateSellerStatus,
  getAuditLogs,
  getDisputes,
  resolveDispute,
  getAdminCategories,
  createAdminCategory,
  deleteAdminCategory,
  getAdminCoupons,
  createAdminCoupon,
  deleteAdminCoupon,
} from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken, requireRoles('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getUsers);
router.patch('/users/:id/toggle-suspend', toggleUserSuspension);
router.get('/sellers', getSellers);
router.patch('/sellers/:id/status', updateSellerStatus);
router.get('/audit-logs', getAuditLogs);
router.get('/disputes', getDisputes);
router.patch('/disputes/:id/resolve', resolveDispute);

// Categories
router.get('/categories', getAdminCategories);
router.post('/categories', createAdminCategory);
router.delete('/categories/:id', deleteAdminCategory);

// Coupons
router.get('/coupons', getAdminCoupons);
router.post('/coupons', createAdminCoupon);
router.delete('/coupons/:id', deleteAdminCoupon);

export default router;
