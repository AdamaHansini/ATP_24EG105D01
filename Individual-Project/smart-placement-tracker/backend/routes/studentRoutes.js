import express from 'express';
import {
  getAllStudents,
  getStudentProfile,
  updateStudentProfile,
  submitApplicationWithResume,
  getStudentApplications,
  getRound2Questions,
  submitRound2Answers,
} from '../controllers/studentController.js';
import { protect, tpoOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// General endpoints
router.get('/', protect, tpoOnly, getAllStudents);
router.get('/profile', protect, getStudentProfile);
router.put('/profile', protect, updateStudentProfile);

// Application endpoints
router.post('/apply/:companyId', protect, submitApplicationWithResume);
router.get('/applications/my', protect, getStudentApplications);
router.get('/applications/:appId/round2-questions', protect, getRound2Questions);
router.post('/applications/:appId/submit-round2', protect, submitRound2Answers);

export default router;
