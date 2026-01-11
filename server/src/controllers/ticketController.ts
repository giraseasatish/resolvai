// server/src/controllers/ticketController.ts

import { Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/authMiddleware';
import { sendEmail } from '../services/emailService'; 

// --- 1. CREATE TICKET ---
export const createTicket = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { subject, description, productId } = req.body;
    const userId = Number(req.user?.userId);

    // 1. Create Ticket
    const ticket = await prisma.ticket.create({
      data: {
        subject,
        customerId: userId,
        productId: Number(productId),
        status: 'OPEN',
        isBotActive: true,
        messages: {
          create: {
            content: description,
            senderId: userId
          }
        }
      },
      include: { 
        messages: true,
        customer: { select: { id: true, name: true, email: true } },
        product: true,
        agent: { select: { id: true, name: true } }
      }
    });

    // 2. REAL-TIME ALERT
    const io = req.app.get('io');
    io.emit('ticket_created', ticket);

    res.status(201).json({ message: 'Ticket created', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error creating ticket', error });
  }
};

// --- 2. GET TICKETS ---
export const getTickets = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = Number(req.user?.userId);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    let whereClause = {};

    if (user.role === 'CUSTOMER') {
      whereClause = { customerId: userId };
    }
    // Agents and Admins see all tickets

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: { 
        product: true, 
        customer: { select: { id: true, name: true, email: true } }, 
        agent: { select: { id: true, name: true } }
      }, 
      orderBy: { createdAt: 'desc' }
    });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tickets', error });
  }
};

// --- 3. GET SINGLE TICKET ---
export const getTicketById = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = Number(req.user?.userId);
    const role = req.user?.role;

    const ticket = await prisma.ticket.findUnique({
      where: { id: Number(id) },
      include: {
        messages: { 
            include: { ticket: false },
            orderBy: { createdAt: 'asc' } 
        },
        product: true,
        customer: { select: { id: true, name: true, email: true } },
        agent: { select: { id: true, name: true } }
      }
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Security: Only Owner or Agent/Admin can view
    if (role === 'CUSTOMER' && ticket.customerId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ticket', error });
  }
};

// --- 4. UPDATE TICKET STATUS ---
export const updateTicketStatus = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const role = req.user?.role;

    // Only Agents/Admins can update status
    if (role !== 'AGENT' && role !== 'ADMIN') {
      return res.status(403).json({ message: "Only agents can update status" });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: Number(id) },
      data: { status },
      include: {
        product: true,
        customer: { select: { id: true, name: true, email: true } },
        agent: { select: { id: true, name: true } }
      }
    });

    // SEND EMAIL IF RESOLVED 
    if (status === 'RESOLVED' && updatedTicket.customer?.email) {
        await sendEmail(
            updatedTicket.customer.email,
            `Ticket #${updatedTicket.id} Resolved`,
            `Hello ${updatedTicket.customer.name},\n\nYour ticket "${updatedTicket.subject}" has been marked as resolved.\n\nThanks for using ResolvAI!`
        );
    }
    

    // Broadcast status change to all connected clients
    const io = req.app.get('io');
    io.emit('ticket_status_updated', updatedTicket);

    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error });
  }
};

// ASSIGN AGENT TO TICKET 
export const assignTicket = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = Number(req.user?.userId);
    const role = req.user?.role;

    // Only Agents/Admins can assign themselves
    if (role !== 'AGENT' && role !== 'ADMIN') {
      return res.status(403).json({ message: "Only agents can assign tickets" });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: Number(id) },
      data: { 
        agentId: userId,
        status: 'ACTIVE' // Automatically set to active when assigned
      },
      include: {
        product: true,
        customer: { select: { id: true, name: true, email: true } },
        agent: { select: { id: true, name: true } }
      }
    });

    // Broadcast assignment
    const io = req.app.get('io');
    io.emit('ticket_assigned', updatedTicket);

    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: "Error assigning ticket", error });
  }
};