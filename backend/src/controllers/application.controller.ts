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
import { AppError, ErrorTypes } from '../utils/appError';

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
  console.log(adminId);
  const { id } = req.params;
  console.log(id);
  const { status, rejectionReason } = req.body;

  if (!adminId) {
    return sendError(res, 401, 'Unauthorized');
  }

  // Validate status
  if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
    return sendError(res, 400, 'Invalid status value');
  }

  // If status is REJECTED, ensure rejectionReason is provided
  if (status === 'REJECTED' && !rejectionReason) {
    return sendError(res, 400, 'Rejection reason is required');
  }

  try {
    const updatedApplication = await updateApplicationStatus(
      id,
      adminId,
      status as ApplicationStatus,
      rejectionReason,
    );

    sendSuccess(res, 200, `Application ${status.toLowerCase()} successfully`, updatedApplication);
  } catch (error) {
    if (error instanceof AppError && error.errorType === ErrorTypes.NOT_FOUND) {
      return sendError(res, 404, 'Application not found');
    }
    throw error;
  }
});

// Delete application by ID
export const deleteApplicationController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await deleteApplication(id);

  sendSuccess(res, 200, 'Application deleted successfully', result);
});
