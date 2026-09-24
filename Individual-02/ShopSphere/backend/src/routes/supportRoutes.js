import express from 'express';
import {
  getTickets,
  getTicketById,
  createTicket,
  addMessage,
  addInternalNote,
  updateTicket,
} from '../controllers/supportController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All support endpoints require authentication
router.use(authenticateToken);

router.get('/tickets', requireRoles('customer', 'seller', 'support', 'admin'), getTickets);
router.post('/tickets', createTicket);
router.get('/tickets/:id', requireRoles('customer', 'seller', 'support', 'admin'), getTicketById);
router.post('/tickets/:id/messages', addMessage);

// Staff-only actions (Support & Admin)
router.post('/tickets/:id/notes', requireRoles('support', 'admin'), addInternalNote);
router.patch('/tickets/:id', requireRoles('support', 'admin'), updateTicket);

export default router;
