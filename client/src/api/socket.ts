// client/src/api/socket.ts
import { io } from 'socket.io-client';

// Connect to backend
export const socket = io('http://localhost:5000', {
  autoConnect: false, // We will connect manually when the user logs in
});