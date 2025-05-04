import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { sendMessage, getUserMessages, markMessageAsRead } from '../services/message.service';
import { sendSuccess } from '../utils/responseHandler';
import { catchAsync } from '../utils/catchAsync';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Send a message to the admin
export const sendMessageController = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const { content } = req.body;
  const senderId = req.user.userId;

  // Validate input
  if (!content || content.trim() === '') {
    throw new AppError('Message content cannot be empty', 400, ErrorTypes.VALIDATION);
  }

  // Ensure the sender is a student
  const user = await prisma.user.findUnique({
    where: { id: senderId },
  });

  if (!user || user.role !== UserRole.STUDENT) {
    throw new AppError(
      'Only students can send messages through this endpoint',
      403,
      ErrorTypes.AUTHORIZATION,
    );
  }

  // Send the message to the admin
  const message = await sendMessage(senderId, content);

  sendSuccess(res, 201, 'Message sent successfully', message);
});

// Get all messages for a user
export const getMessagesController = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const userId = req.user.userId;

  // Extract query parameters with defaults
  const filter = (req.query.filter as 'all' | 'sent' | 'received' | 'unread') || 'all';
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  // Validate page and limit
  if (page < 1) {
    throw new AppError('Page must be greater than 0', 400, ErrorTypes.VALIDATION);
  }

  if (limit < 1 || limit > 50) {
    throw new AppError('Limit must be between 1 and 50', 400, ErrorTypes.VALIDATION);
  }

  // Get messages
  const result = await getUserMessages(userId, filter, page, limit);

  sendSuccess(res, 200, 'Messages retrieved successfully', result);
});

// Mark a message as read
export const markMessageAsReadController = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const { id: messageId } = req.params;
  const userId = req.user.userId;

  // Validate messageId
  if (!messageId) {
    throw new AppError('Message ID is required', 400, ErrorTypes.VALIDATION);
  }

  // Mark the message as read
  const result = await markMessageAsRead(messageId, userId);

  sendSuccess(res, 200, 'Message marked as read', result);
});
