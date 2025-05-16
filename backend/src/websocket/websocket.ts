import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import { SocketEvents } from './types';

// Connected users map: userId -> socketId
const connectedUsers = new Map<string, string>();

// Initialize Socket.IO server
export function initializeSocketIO(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        logger.warn('Socket connection rejected - no token provided');
        return next(new Error('Authentication required'));
      }

      const decoded = verifyToken(token as string);

      if (!decoded) {
        logger.warn('Socket connection rejected - invalid token');
        return next(new Error('Invalid token'));
      }

      // Attach user data to socket
      socket.data.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      logger.error('Socket authentication error', {
        error: error instanceof Error ? error.message : String(error),
      });
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket: Socket) => {
    try {
      const { userId } = socket.data.user;

      // Store user connection
      connectedUsers.set(userId, socket.id);

      logger.info('User connected to socket', { userId, socketId: socket.id });

      // Notify user that connection is established
      socket.emit(SocketEvents.CONNECTED, {
        type: SocketEvents.CONNECTED,
        payload: {
          status: 'success',
          message: 'Connected to messaging service',
        },
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        connectedUsers.delete(userId);
        logger.info('User disconnected from socket', { userId, socketId: socket.id });
      });

      // Handle ping messages to keep connection alive
      socket.on('ping', () => {
        socket.emit('pong');
      });
    } catch (error) {
      logger.error('Socket connection error', {
        socketId: socket.id,
        error: error instanceof Error ? error.message : String(error),
      });
      socket.disconnect(true);
    }
  });

  logger.info('WebSocket server initialized');
  return io;
}

// Send a message to a specific user if they're online
export function sendMessageToUser(
  io: SocketIOServer,
  userId: string,
  event: string,
  data: any,
): boolean {
  try {
    const socketId = connectedUsers.get(userId);

    if (!socketId) {
      // User is offline
      logger.info('User is offline, message not delivered', { userId, event });
      return false;
    }

    io.to(socketId).emit(event, data);
    logger.info('Message sent to user via socket', { userId, socketId, event });
    return true;
  } catch (error) {
    logger.error('Error sending message via socket', {
      userId,
      event,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

// Broadcast a message to all connected users
export function broadcastMessage(io: SocketIOServer, event: string, data: any): void {
  try {
    io.emit(event, data);
    logger.info('Message broadcast to all users', {
      event,
      connectedUsersCount: connectedUsers.size,
    });
  } catch (error) {
    logger.error('Error broadcasting message', {
      event,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Get online status of users
export function getOnlineUsers(): string[] {
  return Array.from(connectedUsers.keys());
}

// Check if a user is online
export function isUserOnline(userId: string): boolean {
  return connectedUsers.has(userId);
}
