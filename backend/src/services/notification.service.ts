import { PrismaClient } from '@prisma/client';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Get notifications for a user
export async function getNotifications(
  userId: string,
  page: number = 1,
  limit: number = 10,
  unreadOnly: boolean = false,
) {
  try {
    logger.info('Fetching notifications', { userId, page, limit, unreadOnly });

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      logger.warn('Get notifications failed - user not found', { userId });
      throw new AppError('User not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where condition
    const whereCondition: any = {
      userId: userId,
    };

    // Add unread filter if requested
    if (unreadOnly) {
      whereCondition.isRead = false;
    }

    // Get total count for pagination
    const totalCount = await prisma.notification.count({
      where: whereCondition,
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Get notifications with pagination
    const notifications = await prisma.notification.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: 'desc', // Most recent first
      },
      skip,
      take: limit,
    });

    logger.info('Notifications retrieved successfully', {
      userId,
      count: notifications.length,
      totalCount,
    });

    return {
      notifications,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    };
  } catch (error) {
    logger.error('Error in getNotifications', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Mark all notifications as read for a user
export async function markAllNotificationsAsRead(userId: string) {
  try {
    logger.info('Marking all notifications as read', { userId });

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      logger.warn('Mark all notifications as read failed - user not found', { userId });
      throw new AppError('User not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Count unread notifications
    const unreadCount = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false,
      },
    });

    // If no unread notifications, return early
    if (unreadCount === 0) {
      logger.info('No unread notifications to mark as read', { userId });
      return { markedAsRead: 0 };
    }

    // Mark all as read
    const result = await prisma.notification.updateMany({
      where: {
        userId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    logger.info('All notifications marked as read successfully', {
      userId,
      count: result.count,
    });

    return { markedAsRead: result.count };
  } catch (error) {
    logger.error('Error in markAllNotificationsAsRead', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Create a notification
export async function createNotification(
  userId: string,
  title: string,
  content: string,
  sendRealtime: boolean = true,
) {
  try {
    logger.info('Creating notification', { userId, title });

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      logger.warn('Create notification failed - user not found', { userId });
      throw new AppError('User not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        title,
        content,
        user: {
          connect: { id: userId },
        },
      },
    });

    // Send real-time notification if requested and Socket.IO server is available
    if (sendRealtime && (global as any).io) {
      const io = (global as any).io;

      // Import here to avoid circular dependency
      const { sendMessageToUser } = require('../websocket/websocket');
      const { SocketEvents } = require('../websocket/types');

      // Send notification via WebSocket
      sendMessageToUser(io, userId, SocketEvents.NEW_NOTIFICATION, {
        notification: {
          id: notification.id,
          title: notification.title,
          content: notification.content,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
        },
      });
    }

    logger.info('Notification created successfully', {
      notificationId: notification.id,
      userId,
    });

    return { notification };
  } catch (error) {
    logger.error('Error in createNotification', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
