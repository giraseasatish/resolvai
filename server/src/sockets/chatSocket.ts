// server/src/sockets/chatSocket.ts

import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { generateAIResponse } from '../services/aiService';

const prisma = new PrismaClient();

export const setupSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User Connected: ${socket.id}`);

    // 1. Join the "Room" for this specific ticket
    socket.on('join_ticket', (ticketId) => {
      socket.join(String(ticketId));
      console.log(`User ${socket.id} joined room: ${ticketId}`);
    });

    // 2. Handle Sending Messages
    socket.on('send_message', async (data) => {
      try {
        const ticketId = Number(data.ticketId);
        const senderId = Number(data.senderId);

        // --- STEP A: IDENTIFY THE SENDER ---
        const user = await prisma.user.findUnique({ where: { id: senderId } });
        const isAgent = user?.role === 'AGENT' || user?.role === 'ADMIN';

        // --- STEP B: SAVE THE MESSAGE ---
        const newMessage = await prisma.message.create({
          data: {
            content: data.content,
            ticketId: ticketId,
            senderId: senderId
          }
        });

        // Broadcast to everyone in the room
        io.to(String(ticketId)).emit('receive_message', newMessage);

        // --- STEP C: CONTROL THE AI 
        if (isAgent) {
          // AGENT IS TALKING - Disable bot and assign agent
          const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId }
          });

          // Only update if not already assigned to this agent
          if (ticket && ticket.agentId !== senderId) {
            const updatedTicket = await prisma.ticket.update({
              where: { id: ticketId },
              data: { 
                isBotActive: false, 
                status: 'ACTIVE',
                agentId: senderId // Auto-assign the agent
              },
              include: {
                product: true,
                customer: { select: { id: true, name: true, email: true } },
                agent: { select: { id: true, name: true } }
              }
            });

            // Broadcast the assignment
            io.emit('ticket_assigned', updatedTicket);
            console.log(`Bot disabled for Ticket #${ticketId} (Agent ${senderId} took over)`);
          }
          
        } else {
          // CUSTOMER IS TALKING - Check if bot should reply
          const ticket = await prisma.ticket.findUnique({ 
            where: { id: ticketId },
            include: { messages: true }
          });

          if (ticket && ticket.isBotActive) {
            // 1. Prepare History
            const history = ticket.messages.slice(-5).map(m => ({
              role: m.senderId ? "User" : "AI",
              content: m.content
            }));

            // 2. Generate Reply
            const aiText = await generateAIResponse(history, data.content);

            // 3. Save & Send AI Message
            const botMsg = await prisma.message.create({
              data: {
                content: aiText,
                ticketId: ticketId,
                senderId: null 
              }
            });

            io.to(String(ticketId)).emit('receive_message', botMsg);
          }
        }

      } catch (error) {
        console.error("Socket Error:", error);
      }
    });

    socket.on('typing', (data) => {
      socket.to(String(data.ticketId)).emit('display_typing', {
        typerName: data.name
      });
    });

    socket.on('stop_typing', (data) => {
      socket.to(String(data.ticketId)).emit('hide_typing');
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};