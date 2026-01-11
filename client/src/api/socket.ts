// client/src/api/socket.ts
import { io } from 'socket.io-client';

// 1. Define the URL based on where the app is running
const SOCKET_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : 'https://resolvai-backend.onrender.com';

// 2. Connect to backend using the smart URL
export const socket = io(SOCKET_URL, {
  autoConnect: false, 
});