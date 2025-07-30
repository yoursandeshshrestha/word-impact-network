import { PrismaClient } from '@prisma/client';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';
import { uploadToVimeo, deleteFromVimeo } from '../utils/vimeo';

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

    // Upload video to Vimeo
    const vimeoResult = await uploadToVimeo(videoFile.path, title, description);

    // Create the video record in the database
    const video = await prisma.video.create({
      data: {
        title,
        description,
        orderIndex,
        duration,
        vimeoId: vimeoResult.videoId,
        vimeoUrl: vimeoResult.videoUrl,
        embedUrl: vimeoResult.embedUrl,
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
 * Create a new video for a chapter with existing Vimeo ID (for direct-to-Vimeo uploads)
 */
export async function createVideoWithVimeoId(
  title: string,
  description: string | undefined,
  orderIndex: number,
  duration: number,
  chapterId: string,
  vimeoId: string,
) {
  try {
    logger.info('Creating new video with Vimeo ID', { title, chapterId, vimeoId });

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

    // Get video info from Vimeo to get the URL
    const { getVimeoVideoInfo, waitForVideoProcessing } = await import('../utils/vimeo');

    // Wait for video processing to get the final embed URL
    const finalEmbedUrl = await waitForVideoProcessing(vimeoId);
    const vimeoInfo = await getVimeoVideoInfo(vimeoId);

    // Create the video record in the database
    const video = await prisma.video.create({
      data: {
        title,
        description,
        orderIndex,
        duration,
        vimeoId,
        vimeoUrl: vimeoInfo.link,
        embedUrl: finalEmbedUrl,
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

    logger.info('Video created successfully with Vimeo ID', { videoId: video.id, vimeoId });
    return video;
  } catch (error) {
    logger.error('Error creating video with Vimeo ID', {
      title,
      chapterId,
      vimeoId,
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
      select: {
        id: true,
        title: true,
        description: true,
        vimeoId: true,
        embedUrl: true,
        duration: true,
        orderIndex: true,
        chapterId: true,
        createdAt: true,
        updatedAt: true,
      },
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
      select: {
        id: true,
        title: true,
        description: true,
        vimeoId: true,
        embedUrl: true,
        duration: true,
        orderIndex: true,
        chapterId: true,
        createdAt: true,
        updatedAt: true,
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
      const description = updateData.description || existingVideo.description;

      // Upload new video to Vimeo
      const newVimeoResult = await uploadToVimeo(videoFile.path, title, description || undefined);

      // Delete old video from Vimeo (if it exists)
      if (existingVideo.vimeoId) {
        await deleteFromVimeo(existingVideo.vimeoId);
      }

      filteredUpdateData.vimeoId = newVimeoResult.videoId;
      filteredUpdateData.vimeoUrl = newVimeoResult.videoUrl;
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

    // Delete the video file from Vimeo if ID exists
    if (video.vimeoId) {
      await deleteFromVimeo(video.vimeoId);
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
