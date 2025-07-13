import { PrismaClient } from '@prisma/client';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';
import { uploadToCloudinary, writeBufferToTempFile, removeTempFile } from '../utils/cloudinary';
import { uploadToVimeo } from '../utils/vimeo';

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
        images: true,
        files: true,
        videos: true,
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
          images: true,
          files: true,
          videos: true,
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
        images: true,
        files: true,
        videos: true,
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
  imageFiles?: Express.Multer.File[],
  fileAttachments?: Express.Multer.File[],
  videoFiles?: Express.Multer.File[],
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

    // Upload images to Cloudinary
    const imageUploads = [];
    if (imageFiles && imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        const imageUrl = await uploadToCloudinary(
          imageFile.buffer,
          'win/announcements/images',
          `announcement-${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        );
        logger.info('Image uploaded to Cloudinary', {
          fileName: imageFile.originalname,
          url: imageUrl,
          size: imageFile.size,
        });
        imageUploads.push({
          url: imageUrl,
          fileName: imageFile.originalname,
          fileSize: imageFile.size,
        });
      }
    }

    // Upload files to Cloudinary
    const fileUploads = [];
    if (fileAttachments && fileAttachments.length > 0) {
      for (const file of fileAttachments) {
        const fileUrl = await uploadToCloudinary(
          file.buffer,
          'win/announcements/files',
          `announcement-${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        );
        fileUploads.push({
          url: fileUrl,
          fileName: file.originalname,
          fileSize: file.size,
          fileType: file.mimetype,
        });
      }
    }

    // Upload videos to Vimeo
    const videoUploads = [];
    if (videoFiles && videoFiles.length > 0) {
      for (const videoFile of videoFiles) {
        // Write video to temp file for Vimeo upload
        const tempFilePath = await writeBufferToTempFile(videoFile.buffer);

        try {
          const vimeoResult = await uploadToVimeo(
            tempFilePath,
            `${title} - ${videoFile.originalname}`,
            content,
          );

          videoUploads.push({
            vimeoId: vimeoResult.videoId,
            vimeoUrl: vimeoResult.videoUrl,
            embedUrl: vimeoResult.embedUrl,
            fileName: videoFile.originalname,
            fileSize: videoFile.size,
          });
        } finally {
          // Clean up temp file
          await removeTempFile(tempFilePath);
        }
      }
    }

    // Create announcement with attachments
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        createdBy: {
          connect: { id: admin.id },
        },
        images: {
          create: imageUploads,
        },
        files: {
          create: fileUploads,
        },
        videos: {
          create: videoUploads,
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
        images: true,
        files: true,
        videos: true,
      },
    });

    logger.info('Announcement created successfully', {
      announcementId: announcement.id,
      adminId: admin.id,
      imageCount: imageUploads.length,
      fileCount: fileUploads.length,
      videoCount: videoUploads.length,
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
  imageFiles?: Express.Multer.File[],
  fileAttachments?: Express.Multer.File[],
  videoFiles?: Express.Multer.File[],
  existingImages?: string[],
  existingFiles?: string[],
  existingVideos?: string[],
  isActive?: boolean,
) {
  try {
    logger.info('Updating announcement', { id, userId });

    // Check if announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        images: true,
        files: true,
        videos: true,
      },
    });

    if (!existingAnnouncement) {
      logger.warn('Update announcement failed - announcement not found', { id });
      throw new AppError('Announcement not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Upload new images to Cloudinary
    const imageUploads = [];
    if (imageFiles && imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        const imageUrl = await uploadToCloudinary(
          imageFile.buffer,
          'win/announcements/images',
          `announcement-${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        );
        imageUploads.push({
          url: imageUrl,
          fileName: imageFile.originalname,
          fileSize: imageFile.size,
        });
      }
    }

    // Upload new files to Cloudinary
    const fileUploads = [];
    if (fileAttachments && fileAttachments.length > 0) {
      for (const file of fileAttachments) {
        const fileUrl = await uploadToCloudinary(
          file.buffer,
          'win/announcements/files',
          `announcement-${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        );
        fileUploads.push({
          url: fileUrl,
          fileName: file.originalname,
          fileSize: file.size,
          fileType: file.mimetype,
        });
      }
    }

    // Upload new videos to Vimeo
    const videoUploads = [];
    if (videoFiles && videoFiles.length > 0) {
      for (const videoFile of videoFiles) {
        // Write video to temp file for Vimeo upload
        const tempFilePath = await writeBufferToTempFile(videoFile.buffer);
        
        try {
          const vimeoResult = await uploadToVimeo(
            tempFilePath,
            `${title} - ${videoFile.originalname}`,
            content,
          );
          
          videoUploads.push({
            vimeoId: vimeoResult.videoId,
            vimeoUrl: vimeoResult.videoUrl,
            embedUrl: vimeoResult.embedUrl,
            fileName: videoFile.originalname,
            fileSize: videoFile.size,
          });
        } finally {
          // Clean up temp file
          await removeTempFile(tempFilePath);
        }
      }
    }

    // Prepare update data
    const updateData: Record<string, any> = {
      title,
      content,
      updatedAt: new Date(),
    };

    // Only add isActive if it was provided
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    // Prepare attachment operations
    const attachmentOperations: Record<string, any> = {};

    // Handle images
    if (existingImages || imageUploads.length > 0) {
      attachmentOperations.images = {
        // Delete images not in existingImages list
        ...(existingImages && {
          deleteMany: {
            id: {
              notIn: existingImages,
            },
          },
        }),
        // Add new images
        ...(imageUploads.length > 0 && {
          create: imageUploads,
        }),
      };
    }

    // Handle files
    if (existingFiles || fileUploads.length > 0) {
      attachmentOperations.files = {
        // Delete files not in existingFiles list
        ...(existingFiles && {
          deleteMany: {
            id: {
              notIn: existingFiles,
            },
          },
        }),
        // Add new files
        ...(fileUploads.length > 0 && {
          create: fileUploads,
        }),
      };
    }

    // Handle videos
    if (existingVideos || videoUploads.length > 0) {
      attachmentOperations.videos = {
        // Delete videos not in existingVideos list
        ...(existingVideos && {
          deleteMany: {
            id: {
              notIn: existingVideos,
            },
          },
        }),
        // Add new videos
        ...(videoUploads.length > 0 && {
          create: videoUploads,
        }),
      };
    }

    // Update announcement with attachment operations
    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...updateData,
        ...attachmentOperations,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
        images: true,
        files: true,
        videos: true,
      },
    });

    logger.info('Announcement updated successfully', {
      announcementId: announcement.id,
      userId,
      newImageCount: imageUploads.length,
      newFileCount: fileUploads.length,
      newVideoCount: videoUploads.length,
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
        images: true,
        files: true,
        videos: true,
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
