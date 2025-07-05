import { PrismaClient } from '@prisma/client';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';
import { uploadToCloudinary } from '../utils/cloudinary';

const prisma = new PrismaClient();

// Get all active announcements
export async function getActiveAnnouncements() {
  try {
    logger.info('Fetching active announcements');

    const announcements = await prisma.announcement.findMany({
      where: {
        isActive: true,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    logger.info('Active announcements retrieved successfully', {
      count: announcements.length,
    });

    return announcements;
  } catch (error) {
    logger.error('Error in getActiveAnnouncements', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get all announcements (admin only)
export async function getAllAnnouncements(page: number = 1, limit: number = 10) {
  try {
    logger.info('Fetching all announcements', { page, limit });

    const skip = (page - 1) * limit;

    const [announcements, totalCount] = await Promise.all([
      prisma.announcement.findMany({
        include: {
          createdBy: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.announcement.count(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    logger.info('All announcements retrieved successfully', {
      count: announcements.length,
      totalCount,
      totalPages,
    });

    return {
      announcements,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    };
  } catch (error) {
    logger.error('Error in getAllAnnouncements', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get single announcement by ID
export async function getAnnouncementById(id: string) {
  try {
    logger.info('Fetching announcement by ID', { id });

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!announcement) {
      logger.warn('Announcement not found', { id });
      throw new AppError('Announcement not found', 404, ErrorTypes.NOT_FOUND);
    }

    logger.info('Announcement retrieved successfully', { id });

    return announcement;
  } catch (error) {
    logger.error('Error in getAnnouncementById', {
      id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Create new announcement
export async function createAnnouncement(
  userId: string,
  title: string,
  content: string,
  imageFile?: Express.Multer.File,
) {
  try {
    logger.info('Creating announcement', { userId, title });

    // Check if admin exists for this user
    const admin = await prisma.admin.findUnique({
      where: { userId: userId },
    });

    if (!admin) {
      logger.warn('Create announcement failed - admin not found for user', { userId });
      throw new AppError('Admin not found', 404, ErrorTypes.NOT_FOUND);
    }

    let imageUrl: string | undefined;

    // Upload image to Cloudinary if provided
    if (imageFile) {
      imageUrl = await uploadToCloudinary(
        imageFile.buffer,
        'win/announcements',
        `announcement-${title.toLowerCase().replace(/\s+/g, '-')}`,
      );
    }

    // Create announcement
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        imageUrl,
        createdBy: {
          connect: { id: admin.id },
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    logger.info('Announcement created successfully', {
      announcementId: announcement.id,
      adminId: admin.id,
    });

    return announcement;
  } catch (error) {
    logger.error('Error in createAnnouncement', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Update announcement
export async function updateAnnouncement(
  id: string,
  userId: string,
  title: string,
  content: string,
  imageFile?: Express.Multer.File,
  isActive?: boolean,
) {
  try {
    logger.info('Updating announcement', { id, userId });

    // Check if announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existingAnnouncement) {
      logger.warn('Update announcement failed - announcement not found', { id });
      throw new AppError('Announcement not found', 404, ErrorTypes.NOT_FOUND);
    }

    let imageUrl: string | undefined;

    // Upload new image to Cloudinary if provided
    if (imageFile) {
      imageUrl = await uploadToCloudinary(
        imageFile.buffer,
        'win/announcements',
        `announcement-${title.toLowerCase().replace(/\s+/g, '-')}`,
      );
    }

    // Prepare update data
    const updateData: Record<string, any> = {
      title,
      content,
      updatedAt: new Date(),
    };

    // Only add imageUrl if a new image was uploaded
    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    // Only add isActive if it was provided
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    // Update announcement
    const announcement = await prisma.announcement.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    logger.info('Announcement updated successfully', {
      announcementId: announcement.id,
      userId,
    });

    return announcement;
  } catch (error) {
    logger.error('Error in updateAnnouncement', {
      id,
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Delete announcement
export async function deleteAnnouncement(id: string) {
  try {
    logger.info('Deleting announcement', { id });

    // Check if announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existingAnnouncement) {
      logger.warn('Delete announcement failed - announcement not found', { id });
      throw new AppError('Announcement not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Delete announcement
    await prisma.announcement.delete({
      where: { id },
    });

    logger.info('Announcement deleted successfully', { id });

    return { message: 'Announcement deleted successfully' };
  } catch (error) {
    logger.error('Error in deleteAnnouncement', {
      id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Toggle announcement active status
export async function toggleAnnouncementStatus(id: string) {
  try {
    logger.info('Toggling announcement status', { id });

    // Check if announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existingAnnouncement) {
      logger.warn('Toggle announcement status failed - announcement not found', { id });
      throw new AppError('Announcement not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Toggle status
    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        isActive: !existingAnnouncement.isActive,
        updatedAt: new Date(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    logger.info('Announcement status toggled successfully', {
      announcementId: announcement.id,
      newStatus: announcement.isActive,
    });

    return announcement;
  } catch (error) {
    logger.error('Error in toggleAnnouncementStatus', {
      id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
