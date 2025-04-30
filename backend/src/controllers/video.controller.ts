import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess } from '../utils/responseHandler';
import { AppError, ErrorTypes } from '../utils/appError';
import {
  createVideo,
  fetchVideosByChapterId,
  fetchVideoById,
  updateVideoById,
  deleteVideoById,
} from '../services/video.service';

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

  const video = await createVideo(
    title,
    description,
    parseInt(orderIndex, 10),
    parseInt(duration, 10),
    chapterId,
    req.file,
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

  const video = await updateVideoById(id, updateData, videoFile);

  sendSuccess(res, 200, 'Video updated successfully', video);
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
