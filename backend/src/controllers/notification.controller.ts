import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess } from '../utils/responseHandler';
import { AppError, ErrorTypes } from '../utils/appError';
import { getNotifications, markAllNotificationsAsRead } from '@/services/notification.service';

const prisma = new PrismaClient();

// Get all notifications for the authenticated user
export const getNotificationsController = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const userId = req.user.userId;

  // Use validated query parameters (these are set by the validation middleware)
  const validatedQuery = (req as any).validatedQuery || {};
  const page = validatedQuery.page || 1;
  const limit = validatedQuery.limit || 10;
  const unreadOnly = validatedQuery.unreadOnly === 'true';

  // Get notifications
  const result = await getNotifications(userId, page, limit, unreadOnly);

  sendSuccess(res, 200, 'Notifications retrieved successfully', result);
});

// Mark all notifications as read
export const markAllNotificationsAsReadController = catchAsync(
  async (req: Request, res: Response) => {
    // Ensure user is authenticated
    if (!req.user) {
      throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
    }

    const userId = req.user.userId;

    // Mark all notifications as read
    const result = await markAllNotificationsAsRead(userId);

    sendSuccess(res, 200, 'All notifications marked as read', result);
  },
);
