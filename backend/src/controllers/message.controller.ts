import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import {
  sendMessage,
  getUserMessages,
  markMessageAsRead,
  sendAdminMessage,
  getUnreadMessagesCount,
} from '../services/message.service';
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

  // Use the validated query parameters
  const validatedQuery = (req as any).validatedQuery || {};
  const filter = validatedQuery.filter || 'all';
  const page = validatedQuery.page || 1;
  const limit = 100;

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

// Send a message from admin to a student
export const sendAdminMessageController = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const { recipientId, content } = req.body;
  const senderId = req.user.userId;

  // Ensure the sender is an admin
  const user = await prisma.user.findUnique({
    where: { id: senderId },
  });

  if (!user || user.role !== UserRole.ADMIN) {
    throw new AppError(
      'Only admins can send messages through this endpoint',
      403,
      ErrorTypes.AUTHORIZATION,
    );
  }

  // Send the message to the student
  const message = await sendAdminMessage(senderId, recipientId, content);

  sendSuccess(res, 201, 'Message sent successfully', message);
});

// Get unread messages count
export const getUnreadMessagesCountController = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const userId = req.user.userId;

  // Get unread count
  const result = await getUnreadMessagesCount(userId);

  sendSuccess(res, 200, 'Unread messages count retrieved successfully', result);
});
