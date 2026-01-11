// src/routes/ticketRoutes.ts

import { Router } from 'express';
import { 
  createTicket, 
  getTickets, 
  getTicketById, 
  updateTicketStatus,
  assignTicket 
} from '../controllers/ticketController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Route: POST /api/tickets/
router.post('/', protect, createTicket);

// Route: GET /api/tickets/
router.get('/', protect, getTickets);

// Route: GET /api/tickets/:id
router.get('/:id', protect, getTicketById);

// Route: PUT /api/tickets/:id/status
router.put('/:id/status', protect, updateTicketStatus);

// Route: PUT /api/tickets/:id/assign (NEW)
router.put('/:id/assign', protect, assignTicket);

export default router;