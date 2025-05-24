import { PrismaClient } from '@prisma/client';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';
import { uploadToBunny, deleteFromBunny } from '../utils/bunny';

const prisma = new PrismaClient();

/**
 * Create a new video for a chapter
 */
export async function createVideo(
  title: string,
  description: string | undefined,
  orderIndex: number,
  duration: number,
  chapterId: string,
  videoFile: Express.Multer.File,
) {
  try {
    logger.info('Creating new video', { title, chapterId });

    // Verify chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        course: true,
      },
    });

    if (!chapter) {
      logger.warn('Video creation failed - chapter not found', { chapterId });
      throw new AppError('Chapter not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if a video with the same orderIndex already exists for this chapter
    const existingVideo = await prisma.video.findFirst({
      where: {
        chapterId,
        orderIndex,
      },
    });

    if (existingVideo) {
      logger.warn('Video creation failed - order index already exists', { chapterId, orderIndex });
      throw new AppError(
        `A video with order index ${orderIndex} already exists for this chapter`,
        400,
        ErrorTypes.VALIDATION,
      );
    }

    // Create a safe title for the folder structure
    const safeTitle = title.toLowerCase().replace(/\s+/g, '-');
    const timestamp = Date.now();

    // Upload video to Bunny CDN - all videos go to 'course-videos' folder
    const bunnyUrl = await uploadToBunny(
      videoFile.buffer,
      `course-videos`,
      `${safeTitle}-${timestamp}.mp4`,
    );

    // Create the video record in the database
    const video = await prisma.video.create({
      data: {
        title,
        description,
        orderIndex,
        duration,
        backblazeUrl: bunnyUrl, // Using the existing field for Bunny CDN URL
        chapterId,
      },
      include: {
        chapter: {
          select: {
            title: true,
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    logger.info('Video created successfully', { videoId: video.id });
    return video;
  } catch (error) {
    logger.error('Error creating video', {
      title,
      chapterId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Fetch all videos for a chapter
 */
export async function fetchVideosByChapterId(chapterId: string) {
  try {
    logger.info('Fetching videos by chapter ID', { chapterId });

    // Verify chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      logger.warn('Fetch videos failed - chapter not found', { chapterId });
      throw new AppError('Chapter not found', 404, ErrorTypes.NOT_FOUND);
    }

    const videos = await prisma.video.findMany({
      where: { chapterId },
      orderBy: { orderIndex: 'asc' },
    });

    return videos;
  } catch (error) {
    logger.error('Error fetching videos', {
      chapterId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Fetch video by ID
 */
export async function fetchVideoById(id: string) {
  try {
    logger.info('Fetching video by ID', { videoId: id });
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        chapter: {
          select: {
            title: true,
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (!video) {
      throw new AppError('Video not found', 404, ErrorTypes.NOT_FOUND);
    }

    return video;
  } catch (error) {
    logger.error('Error fetching video', {
      videoId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Update video by ID
 */
export async function updateVideoById(
  id: string,
  updateData: {
    title?: string;
    description?: string;
    orderIndex?: number;
    duration?: number;
  },
  videoFile?: Express.Multer.File,
) {
  try {
    logger.info('Updating video', { videoId: id });

    // Check if video exists
    const existingVideo = await prisma.video.findUnique({
      where: { id },
      include: {
        chapter: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!existingVideo) {
      throw new AppError('Video not found', 404, ErrorTypes.NOT_FOUND);
    }

    // If orderIndex is being updated, check for conflicts
    if (updateData.orderIndex !== undefined && updateData.orderIndex !== existingVideo.orderIndex) {
      const conflictingVideo = await prisma.video.findFirst({
        where: {
          chapterId: existingVideo.chapterId,
          orderIndex: updateData.orderIndex,
          id: { not: id }, // Exclude the current video
        },
      });

      if (conflictingVideo) {
        throw new AppError(
          `A video with order index ${updateData.orderIndex} already exists for this chapter`,
          400,
          ErrorTypes.VALIDATION,
        );
      }
    }

    // Prepare update data
    const filteredUpdateData: Record<string, any> = {};

    // Only add fields that are explicitly provided
    if (updateData.title !== undefined) filteredUpdateData.title = updateData.title;
    if (updateData.description !== undefined)
      filteredUpdateData.description = updateData.description;
    if (updateData.orderIndex !== undefined) filteredUpdateData.orderIndex = updateData.orderIndex;
    if (updateData.duration !== undefined) filteredUpdateData.duration = updateData.duration;

    // Upload new video file if provided
    if (videoFile) {
      const title = updateData.title || existingVideo.title;
      const safeTitle = title.toLowerCase().replace(/\s+/g, '-');
      const timestamp = Date.now();

      // Upload new video to Bunny CDN - all videos go to 'course-videos' folder
      const newBunnyUrl = await uploadToBunny(
        videoFile.buffer,
        `course-videos`,
        `${safeTitle}-${timestamp}.mp4`,
      );

      // Delete old video from Bunny CDN (if it exists)
      if (existingVideo.backblazeUrl) {
        await deleteFromBunny(existingVideo.backblazeUrl);
      }

      filteredUpdateData.backblazeUrl = newBunnyUrl;
    }

    // If no fields to update, return the current video
    if (Object.keys(filteredUpdateData).length === 0) {
      return await fetchVideoById(id);
    }

    // Update the video
    const video = await prisma.video.update({
      where: { id },
      data: filteredUpdateData,
      include: {
        chapter: {
          select: {
            title: true,
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    logger.info('Video updated successfully', { videoId: video.id });
    return video;
  } catch (error) {
    logger.error('Error updating video', {
      videoId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Delete video by ID
 */
export async function deleteVideoById(id: string) {
  try {
    logger.info('Deleting video', { videoId: id });

    // Check if video exists and get the URL for deletion
    const video = await prisma.video.findUnique({
      where: { id },
    });

    if (!video) {
      throw new AppError('Video not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Delete the video file from Bunny CDN if URL exists
    if (video.backblazeUrl) {
      await deleteFromBunny(video.backblazeUrl);
    }

    // Delete the video record from the database
    await prisma.video.delete({
      where: { id },
    });

    logger.info('Video deleted successfully', { videoId: id });
  } catch (error) {
    logger.error('Error deleting video', {
      videoId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
