import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { setupSocket } from './sockets/chatSocket';
import authRoutes from './routes/authRoutes';
import ticketRoutes from './routes/ticketRoutes';
import productRoutes from './routes/productRoutes';

dotenv.config();

// 1. Export Prisma so other files (like controllers) can use the SAME connection
export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 5000;

// Create Servers
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.set('io', io); // <--- This allows Controllers to access the Socket


app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.use('/api/auth',authRoutes);

app.use('/api/tickets', ticketRoutes);

app.use('/api/products', productRoutes);

//testing route
app.get('/', (req, res) => {
  res.send('ResolvAI Server is Running');
});

// --- INITIALIZE SOCKET LOGIC ---
setupSocket(io);  

// --- START SERVER ---
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

