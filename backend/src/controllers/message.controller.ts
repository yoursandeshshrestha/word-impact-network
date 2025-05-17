import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import {
  sendMessage,
  sendAdminMessage,
  getUnreadMessagesCount,
  getConversations,
  getConversationMessages,
  markConversationAsRead,
  getStudentAdminConversation,
} from '../services/message.service';
import { sendSuccess } from '../utils/responseHandler';
import { catchAsync } from '../utils/catchAsync';
import { AppError, ErrorTypes } from '../utils/appError';

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

// Get all conversations for a user
export const getConversationsController = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const userId = req.user.userId;

  // Get conversations
  const conversations = await getConversations(userId);

  sendSuccess(res, 200, 'Conversations retrieved successfully', { conversations });
});

// Get messages for a specific conversation
export const getConversationMessagesController = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const userId = req.user.userId;
  const { partnerId } = req.params;

  // Use validated query parameters (these are set by the validation middleware)
  const validatedQuery = (req as any).validatedQuery || {};
  const page = validatedQuery.page || 1;
  const limit = validatedQuery.limit || 20;

  // Get conversation messages
  const result = await getConversationMessages(userId, partnerId, page, limit);

  sendSuccess(res, 200, 'Conversation messages retrieved successfully', result);
});

// Mark all messages in a conversation as read
export const markConversationAsReadController = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const userId = req.user.userId;
  const { partnerId } = req.params;

  // Mark conversation as read
  const result = await markConversationAsRead(userId, partnerId);

  sendSuccess(res, 200, 'Conversation marked as read', result);
});

// Get the student-admin conversation (for students)
export const getStudentAdminConversationController = catchAsync(
  async (req: Request, res: Response) => {
    // Ensure user is authenticated
    if (!req.user) {
      throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
    }

    const userId = req.user.userId;

    // Ensure the user is a student
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== UserRole.STUDENT) {
      throw new AppError('Only students can access this endpoint', 403, ErrorTypes.AUTHORIZATION);
    }

    // Use validated query parameters (these are set by the validation middleware)
    const validatedQuery = (req as any).validatedQuery || {};
    const page = validatedQuery.page || 1;
    const limit = validatedQuery.limit || 20;

    // Get student-admin conversation
    const result = await getStudentAdminConversation(userId, page, limit);

    sendSuccess(res, 200, 'Admin conversation retrieved successfully', result);
  },
);
