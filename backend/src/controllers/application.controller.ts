import { Request, Response } from 'express';
import { ApplicationStatus } from '@prisma/client';
import { sendError, sendSuccess } from '../utils/responseHandler';
import { catchAsync } from '../utils/catchAsync';
import {
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
} from '../services/application.service';

// Get all applications with pagination and filtering options
export const getAllApplicationsController = catchAsync(async (req: Request, res: Response) => {
  const { status, page = 1, limit = 10 } = req.query;
  const parsedPage = Number(page);
  const parsedLimit = Number(limit);

  const result = await getAllApplications(
    status as ApplicationStatus | undefined,
    parsedPage,
    parsedLimit,
  );

  sendSuccess(res, 200, 'Applications retrieved successfully', result);
});

// Get application details by ID
export const getApplicationByIdController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const application = await getApplicationById(id);

  sendSuccess(res, 200, 'Application retrieved successfully', application);
});

// Update application status (approve/reject)
export const updateApplicationStatusController = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.user?.userId;
  const { id } = req.params; // Get application ID from URL
  const { status, rejectionReason } = req.body;

  if (!adminId) {
    return sendError(res, 401, 'Unauthorized');
  }

  const updatedApplication = await updateApplicationStatus(
    id, // Use the ID from URL params
    adminId,
    status as ApplicationStatus,
    rejectionReason,
  );

  sendSuccess(res, 200, `Application ${status.toLowerCase()} successfully`, updatedApplication);
});

// Delete application by ID
export const deleteApplicationController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await deleteApplication(id);

  sendSuccess(res, 200, 'Application deleted successfully', result);
});
