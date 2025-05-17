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

// Send a message from admin to a student
export async function sendAdminMessage(adminId: string, studentId: string, content: string) {
  try {
    logger.info('Admin sending message to student', { adminId, studentId });

    // Validate message content
    if (!content || content.trim() === '') {
      throw new AppError('Message content cannot be empty', 400, ErrorTypes.VALIDATION);
    }

    // Check if admin exists and has admin role
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      include: {
        admin: true,
      },
    });

    if (!admin || admin.role !== UserRole.ADMIN) {
      logger.warn('Message send failed - sender is not an admin', {
        adminId,
        senderRole: admin?.role,
      });
      throw new AppError(
        'Only admins can send messages through this endpoint',
        403,
        ErrorTypes.AUTHORIZATION,
      );
    }

    // Check if student exists
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        student: true,
      },
    });

    if (!student || student.role !== UserRole.STUDENT) {
      logger.warn('Message send failed - recipient is not a student', {
        studentId,
        recipientRole: student?.role,
      });
      throw new AppError('Recipient must be a student', 404, ErrorTypes.NOT_FOUND);
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        sender: {
          connect: { id: adminId },
        },
        recipient: {
          connect: { id: studentId },
        },
        isRead: false,
      },
      include: {
        sender: {
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
          },
        },
      },
    });

    // Create a notification for the student
    const notification = await prisma.notification.create({
      data: {
        title: 'New Message from Admin',
        content: `You have received a new message from ${admin.admin?.fullName || 'Admin'}`,
        user: {
          connect: { id: studentId },
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
        fullName: message.sender.admin?.fullName || 'Admin',
      },
      recipient: {
        id: message.recipient.id,
        email: message.recipient.email,
        role: message.recipient.role,
        fullName: message.recipient.student?.fullName || 'Student',
      },
    };

    // Send real-time notification if the Socket.IO server is available
    // and the recipient is online
    if ((global as any).io) {
      const io = (global as any).io;

      // Attempt to send message via WebSocket
      const delivered = sendMessageToUser(io, studentId, SocketEvents.NEW_MESSAGE, {
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
          recipientId: studentId,
        });
      }
    }

    logger.info('Admin message sent successfully', {
      messageId: message.id,
      senderId: adminId,
      recipientId: studentId,
    });

    return formattedMessage;
  } catch (error) {
    logger.error('Error in sendAdminMessage', {
      adminId,
      studentId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get unread messages count for a user
export async function getUnreadMessagesCount(userId: string) {
  try {
    logger.info('Fetching unread messages count', { userId });

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      logger.warn('Get unread count failed - user not found', { userId });
      throw new AppError('User not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Get unread count
    const unreadCount = await prisma.message.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });

    logger.info('Unread messages count retrieved successfully', { userId, unreadCount });

    return { unreadCount };
  } catch (error) {
    logger.error('Error in getUnreadMessagesCount', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get conversations for a user
export async function getConversations(userId: string) {
  try {
    logger.info('Fetching user conversations', { userId });

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      logger.warn('Get conversations failed - user not found', { userId });
      throw new AppError('User not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Get all conversation partners (people the user has exchanged messages with)
    // This uses a raw SQL query to get distinct partners
    const conversationPartners = await prisma.$queryRaw<Array<{ partnerId: string }>>`
      SELECT DISTINCT
        CASE 
          WHEN "senderId" = ${userId} THEN "recipientId"
          WHEN "recipientId" = ${userId} THEN "senderId"
        END as "partnerId"
      FROM "messages" 
      WHERE 
        ("senderId" = ${userId} OR "recipientId" = ${userId})
        AND CASE 
          WHEN "senderId" = ${userId} THEN "recipientId"
          WHEN "recipientId" = ${userId} THEN "senderId"
        END IS NOT NULL
    `;

    // Get conversation details for each partner
    const conversations = await Promise.all(
      conversationPartners.map(async ({ partnerId }) => {
        // Get partner details
        const partner = await prisma.user.findUnique({
          where: { id: partnerId },
          include: {
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
        });

        if (!partner) {
          return null; // Skip if partner not found
        }

        // Get the latest message between the user and this partner
        const latestMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, recipientId: partnerId },
              { senderId: partnerId, recipientId: userId },
            ],
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            sender: {
              select: {
                id: true,
                role: true,
              },
            },
          },
        });

        // Count unread messages from this partner
        const unreadCount = await prisma.message.count({
          where: {
            senderId: partnerId,
            recipientId: userId,
            isRead: false,
          },
        });

        // Format partner details
        const formattedPartner = {
          id: partner.id,
          email: partner.email,
          role: partner.role,
          fullName:
            partner.role === UserRole.ADMIN
              ? partner.admin?.fullName || 'Admin'
              : partner.student?.fullName || 'Student',
        };

        return {
          partner: formattedPartner,
          lastMessage: latestMessage
            ? {
                id: latestMessage.id,
                content: latestMessage.content,
                createdAt: latestMessage.createdAt,
                isFromUser: latestMessage.sender.id === userId,
              }
            : null,
          unreadCount,
        };
      }),
    );

    // Filter out null values and sort by last message timestamp
    const validConversations = conversations.filter(Boolean).sort((a, b) => {
      if (!a?.lastMessage) return -1;
      if (!b?.lastMessage) return 1;
      return (
        new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
      );
    });

    logger.info('Conversations retrieved successfully', {
      userId,
      conversationsCount: validConversations.length,
    });

    return validConversations;
  } catch (error) {
    logger.error('Error in getConversations', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get messages for a specific conversation
export async function getConversationMessages(
  userId: string,
  partnerId: string,
  page: number = 1,
  limit: number = 20,
) {
  try {
    logger.info('Fetching conversation messages', { userId, partnerId, page, limit });

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      logger.warn('Get conversation failed - user not found', { userId });
      throw new AppError('User not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if partner exists
    const partner = await prisma.user.findUnique({
      where: { id: partnerId },
      include: {
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
    });

    if (!partner) {
      logger.warn('Get conversation failed - partner not found', { partnerId });
      throw new AppError('Conversation partner not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await prisma.message.count({
      where: {
        OR: [
          { senderId: userId, recipientId: partnerId },
          { senderId: partnerId, recipientId: userId },
        ],
      },
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Get messages with pagination
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, recipientId: partnerId },
          { senderId: partnerId, recipientId: userId },
        ],
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
        createdAt: 'desc', // Most recent first
      },
      skip,
      take: limit,
    });

    // Get unread message IDs from this conversation
    const unreadMessageIds = messages
      .filter((message) => message.recipientId === userId && !message.isRead)
      .map((message) => message.id);

    // Automatically mark messages as read if they are unread
    if (unreadMessageIds.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: {
            in: unreadMessageIds,
          },
        },
        data: {
          isRead: true,
        },
      });

      // Send read receipts via WebSocket if available
      if ((global as any).io) {
        const io = (global as any).io;

        unreadMessageIds.forEach((messageId) => {
          sendMessageToUser(io, partnerId, 'message_read', {
            messageId,
            readAt: new Date(),
            recipientId: userId,
          });
        });
      }

      logger.info('Marked messages as read', {
        userId,
        partnerId,
        messageCount: unreadMessageIds.length,
      });
    }

    // Format partner details
    const formattedPartner = {
      id: partner.id,
      email: partner.email,
      role: partner.role,
      fullName:
        partner.role === UserRole.ADMIN
          ? partner.admin?.fullName || 'Admin'
          : partner.student?.fullName || 'Student',
    };

    // Format messages for the response
    const formattedMessages = messages.map((message) => ({
      id: message.id,
      content: message.content,
      isRead: message.isRead || unreadMessageIds.includes(message.id), // Consider just-read messages as read
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      isFromUser: message.senderId === userId,
      sender: {
        id: message.sender.id,
        email: message.sender.email,
        role: message.sender.role,
        fullName:
          message.sender.role === UserRole.ADMIN
            ? message.sender.admin?.fullName || 'Admin'
            : message.sender.student?.fullName || 'Student',
      },
    }));

    logger.info('Conversation messages retrieved successfully', {
      userId,
      partnerId,
      count: messages.length,
      markedAsRead: unreadMessageIds.length,
    });

    return {
      partner: formattedPartner,
      messages: formattedMessages,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    };
  } catch (error) {
    logger.error('Error in getConversationMessages', {
      userId,
      partnerId,
      page,
      limit,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Mark all messages in a conversation as read
export async function markConversationAsRead(userId: string, partnerId: string) {
  try {
    logger.info('Marking conversation as read', { userId, partnerId });

    // Find all unread messages from the partner to the user
    const unreadMessages = await prisma.message.findMany({
      where: {
        senderId: partnerId,
        recipientId: userId,
        isRead: false,
      },
      select: {
        id: true,
      },
    });

    // If there are no unread messages, return early
    if (unreadMessages.length === 0) {
      logger.info('No unread messages to mark as read', { userId, partnerId });
      return { markedAsRead: 0 };
    }

    // Get message IDs
    const messageIds = unreadMessages.map((message) => message.id);

    // Mark all as read
    await prisma.message.updateMany({
      where: {
        id: {
          in: messageIds,
        },
      },
      data: {
        isRead: true,
      },
    });

    // Send read receipts via WebSocket if available
    if ((global as any).io) {
      const io = (global as any).io;

      messageIds.forEach((messageId) => {
        sendMessageToUser(io, partnerId, 'message_read', {
          messageId,
          readAt: new Date(),
          recipientId: userId,
        });
      });
    }

    logger.info('Conversation marked as read successfully', {
      userId,
      partnerId,
      messageCount: messageIds.length,
    });

    return { markedAsRead: messageIds.length };
  } catch (error) {
    logger.error('Error in markConversationAsRead', {
      userId,
      partnerId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get the student-admin conversation (simplified - treats all admins as one conversation)
export async function getStudentAdminConversation(
  studentId: string,
  page: number = 1,
  limit: number = 20,
) {
  try {
    logger.info('Fetching student-admin conversation', { studentId, page, limit });

    // Check if student exists
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        student: true,
      },
    });

    if (!student || student.role !== UserRole.STUDENT) {
      logger.warn('Get conversation failed - user is not a student', { studentId });
      throw new AppError('Only students can access this endpoint', 403, ErrorTypes.AUTHORIZATION);
    }

    // Get the first admin (for display purposes)
    const admin = await prisma.admin.findFirst({
      include: {
        user: true,
      },
    });

    if (!admin) {
      logger.warn('Get conversation failed - no admin found');
      throw new AppError('No admin found', 404, ErrorTypes.NOT_FOUND);
    }

    // Format admin details for display
    const formattedAdmin = {
      id: admin.user.id,
      email: admin.user.email,
      role: admin.user.role,
      fullName: admin.fullName || 'Admin',
    };

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination - count all messages between student and ANY admin
    const totalCount = await prisma.message.count({
      where: {
        OR: [
          {
            senderId: studentId,
            recipient: {
              role: UserRole.ADMIN,
            },
          },
          {
            sender: {
              role: UserRole.ADMIN,
            },
            recipientId: studentId,
          },
        ],
      },
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Get messages between student and ANY admin with pagination
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: studentId,
            recipient: {
              role: UserRole.ADMIN,
            },
          },
          {
            sender: {
              role: UserRole.ADMIN,
            },
            recipientId: studentId,
          },
        ],
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Most recent first
      },
      skip,
      take: limit,
    });

    // Get unread message IDs from this conversation
    const unreadMessageIds = messages
      .filter((message) => message.recipientId === studentId && !message.isRead)
      .map((message) => message.id);

    // Automatically mark messages as read if they are unread
    if (unreadMessageIds.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: {
            in: unreadMessageIds,
          },
        },
        data: {
          isRead: true,
        },
      });

      // Send read receipts via WebSocket if available
      if ((global as any).io) {
        const io = (global as any).io;

        for (const message of messages.filter((m) => unreadMessageIds.includes(m.id))) {
          sendMessageToUser(io, message.senderId, 'message_read', {
            messageId: message.id,
            readAt: new Date(),
            recipientId: studentId,
          });
        }
      }

      logger.info('Marked messages as read', {
        studentId,
        messageCount: unreadMessageIds.length,
      });
    }

    // Format messages for the response
    const formattedMessages = messages.map((message) => ({
      id: message.id,
      content: message.content,
      isRead: message.isRead || unreadMessageIds.includes(message.id), // Consider just-read messages as read
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      isFromStudent: message.senderId === studentId,
      sender: {
        id: message.sender.id,
        email: message.sender.email,
        role: message.sender.role,
        fullName:
          message.sender.role === UserRole.ADMIN
            ? message.sender.admin?.fullName || 'Admin'
            : message.sender.student?.fullName || 'Student',
      },
    }));

    logger.info('Student-admin conversation retrieved successfully', {
      studentId,
      count: messages.length,
      markedAsRead: unreadMessageIds.length,
    });

    return {
      admin: formattedAdmin, // Always show the same admin (for display purposes)
      messages: formattedMessages,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    };
  } catch (error) {
    logger.error('Error in getStudentAdminConversation', {
      studentId,
      page,
      limit,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
