import { PrismaClient, UserRole } from '@prisma/client';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';
import { sendMessageToUser } from '../websocket/websocket';
import { SocketEvents } from '../websocket/types';

const prisma = new PrismaClient();

// Send a message to the admin
export async function sendMessage(senderId: string, content: string) {
  try {
    logger.info('Sending message', { senderId });

    // Validate message content
    if (!content || content.trim() === '') {
      throw new AppError('Message content cannot be empty', 400, ErrorTypes.VALIDATION);
    }

    // Check if sender exists
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      include: {
        student: true,
      },
    });

    if (!sender) {
      logger.warn('Message send failed - sender not found', { senderId });
      throw new AppError('Sender not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Verify sender is a student
    if (sender.role !== UserRole.STUDENT) {
      logger.warn('Message send failed - sender is not a student', {
        senderId,
        senderRole: sender.role,
      });
      throw new AppError(
        'Only students can send messages through this endpoint',
        403,
        ErrorTypes.AUTHORIZATION,
      );
    }

    // Get the admin user
    const admin = await prisma.admin.findFirst({
      include: {
        user: true,
      },
    });

    if (!admin) {
      logger.warn('Message send failed - admin not found');
      throw new AppError('Admin not found', 404, ErrorTypes.NOT_FOUND);
    }

    const recipientId = admin.user.id;

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        sender: {
          connect: { id: senderId },
        },
        recipient: {
          connect: { id: recipientId },
        },
        isRead: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            role: true,
            student: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
        recipient: {
          select: {
            id: true,
            email: true,
            role: true,
            admin: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    // Create a notification for the admin
    const notification = await prisma.notification.create({
      data: {
        title: 'New Message',
        content: `You have received a new message from ${sender.student?.fullName || 'Student'}`,
        user: {
          connect: { id: recipientId },
        },
      },
    });

    // Format sender and recipient names for the response
    const formattedMessage = {
      id: message.id,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      sender: {
        id: message.sender.id,
        email: message.sender.email,
        role: message.sender.role,
        fullName: message.sender.student?.fullName || 'Student',
      },
      recipient: {
        id: message.recipient.id,
        email: message.recipient.email,
        role: message.recipient.role,
        fullName: message.recipient.admin?.fullName || 'Admin',
      },
    };

    // Send real-time notification if the Socket.IO server is available
    // and the recipient is online
    if ((global as any).io) {
      const io = (global as any).io;

      // Attempt to send message via WebSocket
      const delivered = sendMessageToUser(io, recipientId, SocketEvents.NEW_MESSAGE, {
        message: formattedMessage,
        notification: {
          id: notification.id,
          title: notification.title,
          content: notification.content,
          createdAt: notification.createdAt,
        },
      });

      if (delivered) {
        logger.info('Real-time message notification delivered', {
          messageId: message.id,
          recipientId,
        });
      }
    }

    logger.info('Message sent successfully', {
      messageId: message.id,
      senderId,
      recipientId,
    });

    return formattedMessage;
  } catch (error) {
    logger.error('Error in sendMessage', {
      senderId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get all messages for a user (both sent and received)
export async function getUserMessages(
  userId: string,
  filter: 'all' | 'sent' | 'received' | 'unread' = 'all',
  page: number = 1,
  limit: number = 10,
) {
  try {
    logger.info('Fetching user messages', { userId, filter, page, limit });

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      logger.warn('Get messages failed - user not found', { userId });
      throw new AppError('User not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Prepare filter conditions
    let whereCondition: any = {};

    if (filter === 'sent') {
      whereCondition = { senderId: userId };
    } else if (filter === 'received') {
      whereCondition = { recipientId: userId };
    } else if (filter === 'unread') {
      whereCondition = { recipientId: userId, isRead: false };
    } else {
      // 'all' - both sent and received
      whereCondition = {
        OR: [{ senderId: userId }, { recipientId: userId }],
      };
    }

    // Get total count for pagination
    const totalCount = await prisma.message.count({
      where: whereCondition,
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Get messages with pagination
    const messages = await prisma.message.findMany({
      where: whereCondition,
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            role: true,
            student: {
              select: {
                id: true,
                fullName: true,
              },
            },
            admin: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
        recipient: {
          select: {
            id: true,
            email: true,
            role: true,
            student: {
              select: {
                id: true,
                fullName: true,
              },
            },
            admin: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Format messages for the response
    const formattedMessages = messages.map((message) => ({
      id: message.id,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      sender: {
        id: message.sender.id,
        email: message.sender.email,
        role: message.sender.role,
        fullName:
          message.sender.role === UserRole.ADMIN
            ? message.sender.admin?.fullName || 'Admin'
            : message.sender.student?.fullName || 'Student',
      },
      recipient: {
        id: message.recipient.id,
        email: message.recipient.email,
        role: message.recipient.role,
        fullName:
          message.recipient.role === UserRole.ADMIN
            ? message.recipient.admin?.fullName || 'Admin'
            : message.recipient.student?.fullName || 'Student',
      },
      // Add a direction field to easily identify if this is a sent or received message
      direction: message.senderId === userId ? 'sent' : 'received',
    }));

    // Get unread count
    const unreadCount = await prisma.message.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });

    logger.info('Messages retrieved successfully', {
      userId,
      count: messages.length,
      unreadCount,
    });

    return {
      messages: formattedMessages,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
      unreadCount,
    };
  } catch (error) {
    logger.error('Error in getUserMessages', {
      userId,
      filter,
      page,
      limit,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Mark a message as read
export async function markMessageAsRead(messageId: string, userId: string) {
  try {
    logger.info('Marking message as read', { messageId, userId });

    // Check if message exists and belongs to the user
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: true,
      },
    });

    if (!message) {
      logger.warn('Mark as read failed - message not found', { messageId });
      throw new AppError('Message not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if user is the recipient of the message
    if (message.recipientId !== userId) {
      logger.warn('Mark as read failed - user is not the recipient', {
        messageId,
        userId,
        recipientId: message.recipientId,
      });
      throw new AppError(
        'You can only mark messages sent to you as read',
        403,
        ErrorTypes.AUTHORIZATION,
      );
    }

    // If already read, just return the message
    if (message.isRead) {
      logger.info('Message is already marked as read', { messageId });
      return {
        id: message.id,
        isRead: true,
        updatedAt: message.updatedAt,
      };
    }

    // Update the message
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });

    // Send real-time notification to the sender that their message was read
    if ((global as any).io) {
      const io = (global as any).io;

      // Attempt to send read receipt via WebSocket
      const delivered = sendMessageToUser(io, message.senderId, 'message_read', {
        messageId: message.id,
        readAt: new Date(),
        recipientId: userId,
      });

      if (delivered) {
        logger.info('Real-time read receipt delivered', {
          messageId: message.id,
          senderId: message.senderId,
        });
      }
    }

    logger.info('Message marked as read successfully', { messageId });

    return {
      id: updatedMessage.id,
      isRead: updatedMessage.isRead,
      updatedAt: updatedMessage.updatedAt,
    };
  } catch (error) {
    logger.error('Error in markMessageAsRead', {
      messageId,
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
