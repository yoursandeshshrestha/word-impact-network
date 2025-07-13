import { PrismaClient } from '@prisma/client';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';
import { uploadToCloudinary, writeBufferToTempFile, removeTempFile } from '../utils/cloudinary';
import { uploadToVimeo } from '../utils/vimeo';

const prisma = new PrismaClient();

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Helper function to ensure unique slug
async function ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    const existingNews = await prisma.news.findUnique({
      where: { slug: uniqueSlug },
    });

    if (!existingNews || existingNews.id === excludeId) {
      break;
    }

    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

// Get all active news (public endpoint)
export async function getActiveNews() {
  try {
    logger.info('Fetching active news');

    const news = await prisma.news.findMany({
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
        videos: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    logger.info('Active news retrieved successfully', {
      count: news.length,
    });

    return news;
  } catch (error) {
    logger.error('Error in getActiveNews', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get all news (admin only)
export async function getAllNews(page: number = 1, limit: number = 10) {
  try {
    logger.info('Fetching all news', { page, limit });

    const skip = (page - 1) * limit;

    const [news, totalCount] = await Promise.all([
      prisma.news.findMany({
        include: {
          createdBy: {
            select: {
              id: true,
              fullName: true,
            },
          },
          images: true,
          videos: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.news.count(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    logger.info('All news retrieved successfully', {
      count: news.length,
      totalCount,
      totalPages,
    });

    return {
      news,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    };
  } catch (error) {
    logger.error('Error in getAllNews', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get single news by ID
export async function getNewsById(id: string) {
  try {
    logger.info('Fetching news by ID', { id });

    const news = await prisma.news.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
        images: true,
        videos: true,
      },
    });

    if (!news) {
      logger.warn('News not found', { id });
      throw new AppError('News not found', 404, ErrorTypes.NOT_FOUND);
    }

    logger.info('News retrieved successfully', { id });

    return news;
  } catch (error) {
    logger.error('Error in getNewsById', {
      id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get single news by slug
export async function getNewsBySlug(slug: string) {
  try {
    logger.info('Fetching news by slug', { slug });

    const news = await prisma.news.findUnique({
      where: { slug },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
        images: true,
        videos: true,
      },
    });

    if (!news) {
      logger.warn('News not found', { slug });
      throw new AppError('News not found', 404, ErrorTypes.NOT_FOUND);
    }

    logger.info('News retrieved successfully', { slug });

    return news;
  } catch (error) {
    logger.error('Error in getNewsBySlug', {
      slug,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Create new news
export async function createNews(
  userId: string,
  title: string,
  description?: string,
  imageFiles?: Express.Multer.File[],
  videoFiles?: Express.Multer.File[],
) {
  try {
    logger.info('Creating news', { userId, title });

    // Check if admin exists for this user
    const admin = await prisma.admin.findUnique({
      where: { userId: userId },
    });

    if (!admin) {
      logger.warn('Create news failed - admin not found for user', { userId });
      throw new AppError('Admin not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Generate and ensure unique slug
    const baseSlug = generateSlug(title);
    const slug = await ensureUniqueSlug(baseSlug);

    // Upload images to Cloudinary
    const imageUploads = [];
    if (imageFiles && imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        const imageUrl = await uploadToCloudinary(
          imageFile.buffer,
          'win/news/images',
          `news-${slug}-${Date.now()}`,
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

    // Upload videos to Vimeo
    const videoUploads = [];
    if (videoFiles && videoFiles.length > 0) {
      for (const videoFile of videoFiles) {
        // Write buffer to temp file for Vimeo upload
        const tempFilePath = await writeBufferToTempFile(videoFile.buffer);
        try {
          const videoData = await uploadToVimeo(tempFilePath, `news-${slug}-${Date.now()}`);
          logger.info('Video uploaded to Vimeo', {
            fileName: videoFile.originalname,
            videoId: videoData.videoId,
            size: videoFile.size,
          });
          videoUploads.push({
            vimeoId: videoData.videoId,
            vimeoUrl: videoData.videoUrl,
            embedUrl: videoData.embedUrl,
            fileName: videoFile.originalname,
            fileSize: videoFile.size,
            duration: undefined, // Vimeo doesn't return duration immediately
          });
        } finally {
          // Clean up temp file
          await removeTempFile(tempFilePath);
        }
      }
    }

    // Create news with attachments
    const news = await prisma.news.create({
      data: {
        title: title.trim(),
        slug,
        description: description?.trim() || null,
        adminId: admin.id,
        images: {
          create: imageUploads,
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
        videos: true,
      },
    });

    logger.info('News created successfully', {
      id: news.id,
      slug: news.slug,
      title: news.title,
    });

    return news;
  } catch (error) {
    logger.error('Error in createNews', {
      userId,
      title,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Update news
export async function updateNews(
  id: string,
  userId: string,
  title?: string,
  description?: string,
  imageFiles?: Express.Multer.File[],
  videoFiles?: Express.Multer.File[],
  existingImages?: string[],
  existingVideos?: string[],
  isActive?: boolean,
) {
  try {
    logger.info('Updating news', { id, userId });

    // Check if admin exists for this user
    const admin = await prisma.admin.findUnique({
      where: { userId: userId },
    });

    if (!admin) {
      logger.warn('Update news failed - admin not found for user', { userId });
      throw new AppError('Admin not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if news exists
    const existingNews = await prisma.news.findUnique({
      where: { id },
      include: {
        images: true,
        videos: true,
      },
    });

    if (!existingNews) {
      logger.warn('Update news failed - news not found', { id });
      throw new AppError('News not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Generate new slug if title is being updated
    let slug = existingNews.slug;
    if (title && title !== existingNews.title) {
      const baseSlug = generateSlug(title);
      slug = await ensureUniqueSlug(baseSlug, id);
    }

    // Upload new images to Cloudinary
    const imageUploads: any[] = [];
    if (imageFiles && imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        const imageUrl = await uploadToCloudinary(
          imageFile.buffer,
          'win/news/images',
          `news-${slug}-${Date.now()}`,
        );
        imageUploads.push({
          url: imageUrl,
          fileName: imageFile.originalname,
          fileSize: imageFile.size,
        });
      }
    }

    // Upload new videos to Vimeo
    const videoUploads: any[] = [];
    if (videoFiles && videoFiles.length > 0) {
      for (const videoFile of videoFiles) {
        // Write buffer to temp file for Vimeo upload
        const tempFilePath = await writeBufferToTempFile(videoFile.buffer);
        try {
          const videoData = await uploadToVimeo(tempFilePath, `news-${slug}-${Date.now()}`);
          videoUploads.push({
            vimeoId: videoData.videoId,
            vimeoUrl: videoData.videoUrl,
            embedUrl: videoData.embedUrl,
            fileName: videoFile.originalname,
            fileSize: videoFile.size,
            duration: undefined, // Vimeo doesn't return duration immediately
          });
        } finally {
          // Clean up temp file
          await removeTempFile(tempFilePath);
        }
      }
    }

    // Update news with transaction to handle attachments
    const news = await prisma.$transaction(async (tx) => {
      // Delete removed images - only if existingImages array is provided and not empty
      if (existingImages !== undefined && existingImages.length > 0) {
        await tx.newsImage.deleteMany({
          where: {
            newsId: id,
            id: {
              notIn: existingImages,
            },
          },
        });
      }

      // Delete removed videos - only if existingVideos array is provided and not empty
      if (existingVideos !== undefined && existingVideos.length > 0) {
        await tx.newsVideo.deleteMany({
          where: {
            newsId: id,
            id: {
              notIn: existingVideos,
            },
          },
        });
      }

      // Update news
      const updatedNews = await tx.news.update({
        where: { id },
        data: {
          title: title?.trim(),
          slug,
          description: description?.trim(),
          isActive,
          images: {
            create: imageUploads,
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
          videos: true,
        },
      });

      return updatedNews;
    });

    logger.info('News updated successfully', {
      id: news.id,
      slug: news.slug,
      title: news.title,
    });

    return news;
  } catch (error) {
    logger.error('Error in updateNews', {
      id,
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Delete news
export async function deleteNews(id: string) {
  try {
    logger.info('Deleting news', { id });

    const news = await prisma.news.findUnique({
      where: { id },
    });

    if (!news) {
      logger.warn('Delete news failed - news not found', { id });
      throw new AppError('News not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Delete news (cascade will handle images and videos)
    await prisma.news.delete({
      where: { id },
    });

    logger.info('News deleted successfully', { id });

    return { message: 'News deleted successfully' };
  } catch (error) {
    logger.error('Error in deleteNews', {
      id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Toggle news status
export async function toggleNewsStatus(id: string) {
  try {
    logger.info('Toggling news status', { id });

    const news = await prisma.news.findUnique({
      where: { id },
    });

    if (!news) {
      logger.warn('Toggle news status failed - news not found', { id });
      throw new AppError('News not found', 404, ErrorTypes.NOT_FOUND);
    }

    const updatedNews = await prisma.news.update({
      where: { id },
      data: {
        isActive: !news.isActive,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
        images: true,
        videos: true,
      },
    });

    logger.info('News status toggled successfully', {
      id: updatedNews.id,
      isActive: updatedNews.isActive,
    });

    return updatedNews;
  } catch (error) {
    logger.error('Error in toggleNewsStatus', {
      id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
