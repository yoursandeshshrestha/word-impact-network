import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess } from '../utils/responseHandler';
import { AppError, ErrorTypes } from '../utils/appError';
import {
  createChapter,
  fetchChaptersByCourseId,
  fetchChapterById,
  updateChapterById,
  deleteChapterById,
  reorderChapter,
} from '@/services/chapter.service';

/**
 * Create a new chapter
 * @route POST /api/v1/courses/:courseId/chapters
 * @access Private (Admin only)
 */
export const createChapterController = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const adminId = req.user.userId;
  const { courseId } = req.params;
  const { title, description, orderIndex, courseYear } = req.body;

  const chapter = await createChapter(
    title,
    description,
    parseInt(orderIndex, 10),
    parseInt(courseYear, 10),
    courseId,
    adminId,
  );

  sendSuccess(res, 201, 'Chapter created successfully', chapter);
});

/**
 * Get all chapters for a course
 * @route GET /api/v1/courses/:courseId/chapters
 * @access Public
 */
export const getChaptersByCourseId = catchAsync(async (req: Request, res: Response) => {
  const { courseId } = req.params;

  const chapters = await fetchChaptersByCourseId(courseId);

  sendSuccess(res, 200, 'Chapters retrieved successfully', chapters);
});

/**
 * Get chapter by ID
 * @route GET /api/v1/chapters/:id
 * @access Public
 */
export const getChapterById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const chapter = await fetchChapterById(id);

  if (!chapter) {
    throw new AppError('Chapter not found', 404, ErrorTypes.NOT_FOUND);
  }

  sendSuccess(res, 200, 'Chapter retrieved successfully', chapter);
});

/**
 * Update chapter by ID
 * @route PUT /api/v1/chapters/:id
 * @access Private (Admin only)
 */
export const updateChapter = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const { id } = req.params;
  const { title, description, orderIndex, courseYear } = req.body;

  const updateData: {
    title?: string;
    description?: string;
    orderIndex?: number;
    courseYear?: number;
  } = {};

  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;

  if (orderIndex !== undefined) {
    updateData.orderIndex = parseInt(orderIndex, 10);
    if (isNaN(updateData.orderIndex)) {
      throw new AppError('Order index must be a valid number', 400, ErrorTypes.VALIDATION);
    }
  }

  if (courseYear !== undefined) {
    updateData.courseYear = parseInt(courseYear, 10);
    if (isNaN(updateData.courseYear)) {
      throw new AppError('Course year must be a valid number', 400, ErrorTypes.VALIDATION);
    }
  }

  const chapter = await updateChapterById(id, updateData);

  sendSuccess(res, 200, 'Chapter updated successfully', chapter);
});

/**
 * Delete chapter by ID
 * @route DELETE /api/v1/chapters/:id
 * @access Private (Admin only)
 */
export const deleteChapter = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const { id } = req.params;

  await deleteChapterById(id);

  sendSuccess(res, 200, 'Chapter deleted successfully', { id });
});

/**
 * Reorder chapter
 * @route PATCH /api/v1/chapters/:id/reorder
 * @access Private (Admin only)
 */
export const reorderChapterController = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const { id } = req.params;
  const { newOrderIndex, newCourseYear } = req.body;

  // Validate input
  if (newOrderIndex === undefined || isNaN(parseInt(newOrderIndex, 10))) {
    throw new AppError(
      'New order index is required and must be a valid number',
      400,
      ErrorTypes.VALIDATION,
    );
  }

  let parsedNewCourseYear = undefined;
  if (newCourseYear !== undefined) {
    parsedNewCourseYear = parseInt(newCourseYear, 10);
    if (isNaN(parsedNewCourseYear)) {
      throw new AppError('New course year must be a valid number', 400, ErrorTypes.VALIDATION);
    }
  }

  const chapter = await reorderChapter(id, parseInt(newOrderIndex, 10), parsedNewCourseYear);

  sendSuccess(res, 200, 'Chapter reordered successfully', chapter);
});
