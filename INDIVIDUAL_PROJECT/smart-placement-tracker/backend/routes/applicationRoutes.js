import express from 'express';
import {
  getApplicationsByCompany,
  getStudentApplications,
  reviewRound1Resume,
  inviteToRound2,
  evaluateRound2,
  makeFinalDecision,
} from '../controllers/applicationController.js';
import { submitRound2Answers } from '../controllers/studentController.js';
import { protect, tpoOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Student endpoints
router.get('/my', protect, getStudentApplications);
router.post('/:id/submit-round2', protect, submitRound2Answers);

// TPO endpoints
router.get('/company/:companyId', protect, tpoOnly, getApplicationsByCompany);
router.put('/:id/review-round1', protect, tpoOnly, reviewRound1Resume);
router.put('/:id/invite-round2', protect, tpoOnly, inviteToRound2);
router.put('/:id/evaluate-round2', protect, tpoOnly, evaluateRound2);
router.put('/:id/final-decision', protect, tpoOnly, makeFinalDecision);

export default router;
