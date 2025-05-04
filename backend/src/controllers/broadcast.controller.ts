import { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { broadcastMessage } from '../websocket/websocket';
import { sendSuccess } from '../utils/responseHandler';
import { catchAsync } from '../utils/catchAsync';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';
import { SocketEvents } from '@/websocket/types';

export const sendBroadcastController = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated and is an admin
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  if (req.user.role !== UserRole.ADMIN) {
    throw new AppError('Only administrators can send broadcasts', 403, ErrorTypes.AUTHORIZATION);
  }

  const { title, message } = req.body;

  // Validate input
  if (!message || message.trim() === '') {
    throw new AppError('Broadcast message cannot be empty', 400, ErrorTypes.VALIDATION);
  }

  // Access the Socket.IO server instance
  const io = (global as any).io;

  if (!io) {
    throw new AppError('Socket server not available', 500, ErrorTypes.SERVER);
  }

  // Send the broadcast to all connected clients
  broadcastMessage(io, SocketEvents.ANNOUNCEMENT, {
    title: title || 'System Announcement',
    message,
    timestamp: new Date(),
    sender: {
      id: req.user.userId,
      role: UserRole.ADMIN,
    },
  });

  logger.info('Broadcast message sent', {
    adminId: req.user.userId,
    title,
    messagePreview: message.substring(0, 50),
  });

  sendSuccess(res, 200, 'Broadcast message sent to all connected users', {
    title: title || 'System Announcement',
    message,
    timestamp: new Date(),
  });
});
