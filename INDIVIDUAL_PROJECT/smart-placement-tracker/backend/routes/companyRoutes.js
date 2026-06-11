import express from 'express';
import {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  approveCompany,
  rejectCompany,
} from '../controllers/companyController.js';
import { protect, tpoOnly, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllCompanies);
router.post('/', protect, tpoOnly, createCompany);
router.put('/:id/approve', protect, adminOnly, approveCompany);
router.put('/:id/reject', protect, adminOnly, rejectCompany);
router.get('/:id', protect, getCompanyById);
router.put('/:id', protect, tpoOnly, updateCompany);
router.delete('/:id', protect, tpoOnly, deleteCompany);

export default router;
