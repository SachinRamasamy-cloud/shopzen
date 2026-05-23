import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import { registerOrderSockets } from '../sockets/orderSocket.js';
import { registerNotificationSockets } from '../sockets/notificationSocket.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = verifyAccessToken(token);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { id: userId, role } = socket.user;
    console.log(`[socket] connected uid=${userId} role=${role}`);

    // Join personal room
    socket.join(`user:${userId}`);
    socket.join(`role:${role}`);

    registerOrderSockets(io, socket);
    registerNotificationSockets(io, socket);

    socket.on('disconnect', () => {
      console.log(`[socket] disconnected uid=${userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};
