import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess, sendError } from '../utils/responseHandler';
import { logger } from '../utils/logger';
import { PrismaClient } from '@prisma/client';
import { videoProcessingQueue } from '../config/queue';
import { AppError, ErrorTypes } from '../utils/appError';
import {
  createVideo,
  createVideoWithVimeoId,
  fetchVideosByChapterId,
  fetchVideoById,
  updateVideoById,
  deleteVideoById,
} from '../services/video.service';
import { cleanupTempFile } from '../utils/upload';

const prisma = new PrismaClient();

/**
 * Get video processing status
 */
export const getVideoStatus = catchAsync(async (req: Request, res: Response) => {
  const { videoId } = req.params;

  if (!videoId) {
    return sendError(res, 400, 'Video ID is required');
  }

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: {
      id: true,
      title: true,
      status: true,
      processingJobId: true,
      errorMessage: true,
      processedAt: true,
      embedUrl: true,
      vimeoId: true,
    },
  });

  if (!video) {
    return sendError(res, 404, 'Video not found');
  }

  // If video is processing, get job status
  let jobStatus = null;
  if (video.processingJobId) {
    try {
      const job = await videoProcessingQueue.getJob(video.processingJobId);
      if (job) {
        jobStatus = {
          id: job.id,
          status: await job.getState(),
          progress: job.progress(),
          failedReason: job.failedReason,
        };
      }
    } catch (error) {
      logger.error('Error getting job status', { videoId, jobId: video.processingJobId, error });
    }
  }

  sendSuccess(res, 200, 'Video status retrieved', {
    video,
    jobStatus,
  });
});

/**
 * Get all videos with their processing status for a chapter
 */
export const getVideosWithStatus = catchAsync(async (req: Request, res: Response) => {
  const { chapterId } = req.params;

  if (!chapterId) {
    return sendError(res, 400, 'Chapter ID is required');
  }

  const videos = await prisma.video.findMany({
    where: { chapterId },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      processingJobId: true,
      errorMessage: true,
      processedAt: true,
      embedUrl: true,
      vimeoId: true,
      duration: true,
      orderIndex: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { orderIndex: 'asc' },
  });

  // Get job status for processing videos
  const videosWithJobStatus = await Promise.all(
    videos.map(async (video) => {
      let jobStatus = null;
      if (video.processingJobId) {
        try {
          const job = await videoProcessingQueue.getJob(video.processingJobId);
          if (job) {
            jobStatus = {
              id: job.id,
              status: await job.getState(),
              progress: job.progress(),
              failedReason: job.failedReason,
            };
          }
        } catch (error) {
          logger.error('Error getting job status', {
            videoId: video.id,
            jobId: video.processingJobId,
            error,
          });
        }
      }

      return {
        ...video,
        jobStatus,
      };
    }),
  );

  sendSuccess(res, 200, 'Videos with status retrieved', {
    videos: videosWithJobStatus,
  });
});

/**
 * Add video to chapter
 * @route POST /api/v1/chapters/:chapterId/videos
 * @access Private (Admin only)
 */
export const addVideoToChapter = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const { chapterId } = req.params;
  const { title, description, orderIndex, duration } = req.body;

  // Validate file exists
  if (!req.file) {
    throw new AppError('Video file is required', 400, ErrorTypes.VALIDATION);
  }

  try {
    const video = await createVideo(
      title,
      description,
      parseInt(orderIndex, 10),
      parseInt(duration, 10),
      chapterId,
      req.file,
    );

    sendSuccess(res, 201, 'Video added successfully', video);
  } finally {
    // Clean up the temporary file
    if (req.file?.path) {
      cleanupTempFile(req.file.path);
    }
  }
});

/**
 * Add video to chapter with Vimeo ID (for direct-to-Vimeo uploads)
 * @route POST /api/v1/chapters/:chapterId/videos/vimeo
 * @access Private (Admin only)
 */
export const addVideoToChapterWithVimeo = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const { chapterId } = req.params;
  const { title, description, orderIndex, duration, vimeoId } = req.body;

  const video = await createVideoWithVimeoId(
    title,
    description,
    parseInt(orderIndex, 10),
    parseInt(duration, 10),
    chapterId,
    vimeoId,
  );

  sendSuccess(res, 201, 'Video added successfully', video);
});

/**
 * Get all videos for a chapter
 * @route GET /api/v1/chapters/:chapterId/videos
 * @access Public
 */
export const getVideosByChapterId = catchAsync(async (req: Request, res: Response) => {
  const { chapterId } = req.params;

  const videos = await fetchVideosByChapterId(chapterId);

  sendSuccess(res, 200, 'Videos retrieved successfully', videos);
});

/**
 * Get video by ID
 * @route GET /api/v1/videos/:id
 * @access Public
 */
export const getVideoById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const video = await fetchVideoById(id);

  if (!video) {
    throw new AppError('Video not found', 404, ErrorTypes.NOT_FOUND);
  }

  sendSuccess(res, 200, 'Video retrieved successfully', video);
});

/**
 * Update video by ID
 * @route PUT /api/v1/videos/:id
 * @access Private (Admin only)
 */
export const updateVideo = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const { id } = req.params;
  const { title, description, orderIndex, duration } = req.body;
  const videoFile = req.file;

  const updateData: {
    title?: string;
    description?: string;
    orderIndex?: number;
    duration?: number;
  } = {};

  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;

  if (orderIndex !== undefined) {
    updateData.orderIndex = parseInt(orderIndex, 10);
    if (isNaN(updateData.orderIndex)) {
      throw new AppError('Order index must be a valid number', 400, ErrorTypes.VALIDATION);
    }
  }

  if (duration !== undefined) {
    updateData.duration = parseInt(duration, 10);
    if (isNaN(updateData.duration)) {
      throw new AppError('Duration must be a valid number', 400, ErrorTypes.VALIDATION);
    }
  }

  try {
    const video = await updateVideoById(id, updateData, videoFile);
    sendSuccess(res, 200, 'Video updated successfully', video);
  } finally {
    // Clean up the temporary file
    if (videoFile?.path) {
      cleanupTempFile(videoFile.path);
    }
  }
});

/**
 * Delete video by ID
 * @route DELETE /api/v1/videos/:id
 * @access Private (Admin only)
 */
export const deleteVideo = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const { id } = req.params;

  await deleteVideoById(id);

  sendSuccess(res, 200, 'Video deleted successfully', { id });
});
