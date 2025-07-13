import { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess } from '../utils/responseHandler';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';
import {
  getActiveNews,
  getAllNews,
  getNewsById,
  getNewsBySlug,
  createNews,
  updateNews,
  deleteNews,
  toggleNewsStatus,
} from '../services/news.service';

// Get all active news (public endpoint)
export const getActiveNewsController = catchAsync(async (req: Request, res: Response) => {
  const news = await getActiveNews();
  sendSuccess(res, 200, 'Active news retrieved successfully', news);
});

// Get all news (admin only)
export const getAllNewsController = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated and is an admin
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  if (req.user.role !== UserRole.ADMIN) {
    throw new AppError('Only administrators can access all news', 403, ErrorTypes.AUTHORIZATION);
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await getAllNews(page, limit);
  sendSuccess(res, 200, 'All news retrieved successfully', result);
});

// Get single news by ID
export const getNewsByIdController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError('News ID is required', 400, ErrorTypes.VALIDATION);
  }

  const news = await getNewsById(id);
  sendSuccess(res, 200, 'News retrieved successfully', news);
});

// Get single news by slug
export const getNewsBySlugController = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    throw new AppError('News slug is required', 400, ErrorTypes.VALIDATION);
  }

  const news = await getNewsBySlug(slug);
  sendSuccess(res, 200, 'News retrieved successfully', news);
});

// Create new news (admin only)
export const createNewsController = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated and is an admin
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  if (req.user.role !== UserRole.ADMIN) {
    throw new AppError('Only administrators can create news', 403, ErrorTypes.AUTHORIZATION);
  }

  const { title, description } = req.body;

  // Get files from the request
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const imageFiles = files?.images || [];
  const videoFiles = files?.videos || [];

  // Validate required fields
  if (!title || title.trim() === '') {
    throw new AppError('Title is required', 400, ErrorTypes.VALIDATION);
  }

  const news = await createNews(
    req.user.userId,
    title.trim(),
    description?.trim(),
    imageFiles,
    videoFiles,
  );

  sendSuccess(res, 201, 'News created successfully', news);
});

// Update news (admin only)
export const updateNewsController = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated and is an admin
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  if (req.user.role !== UserRole.ADMIN) {
    throw new AppError('Only administrators can update news', 403, ErrorTypes.AUTHORIZATION);
  }

  const { id } = req.params;
  const { title, description, isActive } = req.body;

  // Get files from the request
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const imageFiles = files?.images || [];
  const videoFiles = files?.videos || [];

  // Get existing attachment IDs to keep
  const existingImages = req.body.existingImages
    ? Array.isArray(req.body.existingImages)
      ? req.body.existingImages
      : [req.body.existingImages]
    : undefined;
  const existingVideos = req.body.existingVideos
    ? Array.isArray(req.body.existingVideos)
      ? req.body.existingVideos
      : [req.body.existingVideos]
    : undefined;

  if (!id) {
    throw new AppError('News ID is required', 400, ErrorTypes.VALIDATION);
  }

  // Validate required fields if title is being updated
  if (title !== undefined && (!title || title.trim() === '')) {
    throw new AppError('Title cannot be empty', 400, ErrorTypes.VALIDATION);
  }

  const news = await updateNews(
    id,
    req.user.userId,
    title?.trim(),
    description?.trim(),
    imageFiles,
    videoFiles,
    existingImages,
    existingVideos,
    isActive,
  );

  sendSuccess(res, 200, 'News updated successfully', news);
});

// Delete news (admin only)
export const deleteNewsController = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated and is an admin
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  if (req.user.role !== UserRole.ADMIN) {
    throw new AppError('Only administrators can delete news', 403, ErrorTypes.AUTHORIZATION);
  }

  const { id } = req.params;

  if (!id) {
    throw new AppError('News ID is required', 400, ErrorTypes.VALIDATION);
  }

  const result = await deleteNews(id);
  sendSuccess(res, 200, 'News deleted successfully', result);
});

// Toggle news status (admin only)
export const toggleNewsStatusController = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated and is an admin
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  if (req.user.role !== UserRole.ADMIN) {
    throw new AppError('Only administrators can toggle news status', 403, ErrorTypes.AUTHORIZATION);
  }

  const { id } = req.params;

  if (!id) {
    throw new AppError('News ID is required', 400, ErrorTypes.VALIDATION);
  }

  const news = await toggleNewsStatus(id);
  sendSuccess(res, 200, 'News status toggled successfully', news);
});
