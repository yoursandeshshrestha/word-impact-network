import { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess } from '../utils/responseHandler';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';
import {
  getActiveAnnouncements,
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus,
} from '../services/announcement.service';

// Get all active announcements (public endpoint)
export const getActiveAnnouncementsController = catchAsync(async (req: Request, res: Response) => {
  const announcements = await getActiveAnnouncements();
  sendSuccess(res, 200, 'Active announcements retrieved successfully', announcements);
});

// Get all announcements (admin only)
export const getAllAnnouncementsController = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated and is an admin
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  if (req.user.role !== UserRole.ADMIN) {
    throw new AppError(
      'Only administrators can access all announcements',
      403,
      ErrorTypes.AUTHORIZATION,
    );
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await getAllAnnouncements(page, limit);
  sendSuccess(res, 200, 'All announcements retrieved successfully', result);
});

// Get single announcement by ID
export const getAnnouncementByIdController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError('Announcement ID is required', 400, ErrorTypes.VALIDATION);
  }

  const announcement = await getAnnouncementById(id);
  sendSuccess(res, 200, 'Announcement retrieved successfully', announcement);
});

// Create new announcement (admin only)
export const createAnnouncementController = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated and is an admin
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  if (req.user.role !== UserRole.ADMIN) {
    throw new AppError(
      'Only administrators can create announcements',
      403,
      ErrorTypes.AUTHORIZATION,
    );
  }

  const { title, content } = req.body;
  // Get the image from the file upload if available
  const imageFile = req.file;

  // Validate required fields
  if (!title || title.trim() === '') {
    throw new AppError('Title is required', 400, ErrorTypes.VALIDATION);
  }

  if (!content || content.trim() === '') {
    throw new AppError('Content is required', 400, ErrorTypes.VALIDATION);
  }

  const announcement = await createAnnouncement(
    req.user.userId,
    title.trim(),
    content.trim(),
    imageFile,
  );

  sendSuccess(res, 201, 'Announcement created successfully', announcement);
});

// Update announcement (admin only)
export const updateAnnouncementController = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated and is an admin
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  if (req.user.role !== UserRole.ADMIN) {
    throw new AppError(
      'Only administrators can update announcements',
      403,
      ErrorTypes.AUTHORIZATION,
    );
  }

  const { id } = req.params;
  const { title, content, isActive } = req.body;
  // Get the image from the file upload if available
  const imageFile = req.file;

  if (!id) {
    throw new AppError('Announcement ID is required', 400, ErrorTypes.VALIDATION);
  }

  // Validate required fields
  if (!title || title.trim() === '') {
    throw new AppError('Title is required', 400, ErrorTypes.VALIDATION);
  }

  if (!content || content.trim() === '') {
    throw new AppError('Content is required', 400, ErrorTypes.VALIDATION);
  }

  const announcement = await updateAnnouncement(
    id,
    req.user.userId,
    title.trim(),
    content.trim(),
    imageFile,
    isActive,
  );

  sendSuccess(res, 200, 'Announcement updated successfully', announcement);
});

// Delete announcement (admin only)
export const deleteAnnouncementController = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated and is an admin
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  if (req.user.role !== UserRole.ADMIN) {
    throw new AppError(
      'Only administrators can delete announcements',
      403,
      ErrorTypes.AUTHORIZATION,
    );
  }

  const { id } = req.params;

  if (!id) {
    throw new AppError('Announcement ID is required', 400, ErrorTypes.VALIDATION);
  }

  const result = await deleteAnnouncement(id);
  sendSuccess(res, 200, 'Announcement deleted successfully', result);
});

// Toggle announcement status (admin only)
export const toggleAnnouncementStatusController = catchAsync(
  async (req: Request, res: Response) => {
    // Ensure user is authenticated and is an admin
    if (!req.user) {
      throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
    }

    if (req.user.role !== UserRole.ADMIN) {
      throw new AppError(
        'Only administrators can toggle announcement status',
        403,
        ErrorTypes.AUTHORIZATION,
      );
    }

    const { id } = req.params;

    if (!id) {
      throw new AppError('Announcement ID is required', 400, ErrorTypes.VALIDATION);
    }

    const announcement = await toggleAnnouncementStatus(id);
    sendSuccess(res, 200, 'Announcement status toggled successfully', announcement);
  },
);
