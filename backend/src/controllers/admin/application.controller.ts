import { Request, Response } from 'express';
import { ApplicationStatus } from '@prisma/client';
import { z } from 'zod';
import {
  getApplicationById,
  updateApplicationStatus,
  createUserFromApplication,
} from '../../services/user.service';
import {
  sendApplicationStatusEmail,
  sendAccountCreationEmail,
  generateTemporaryPassword,
} from '../../services/email.service';
import prisma from '../../config/prisma';

// Schema for application status update
const updateStatusSchema = z.object({
  status: z.enum([ApplicationStatus.APPROVED, ApplicationStatus.REJECTED] as [string, ...string[]]),
});

/**
 * Get all applications
 * @param req Express request
 * @param res Express response
 */
export const getAllApplicationsController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Parse query parameters for pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as ApplicationStatus | undefined;

    const skip = (page - 1) * limit;

    // Build the where clause conditionally
    const where = status ? { status } : {};

    // Get applications with pagination
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.application.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve applications',
    });
  }
};

/**
 * Get application by ID
 * @param req Express request
 * @param res Express response
 */
export const getApplicationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get application
    const application = await getApplicationById(id);

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve application',
    });
  }
};

/**
 * Update application status
 * @param req Express request
 * @param res Express response
 */
export const updateApplicationStatusController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate request body
    const validatedData = updateStatusSchema.parse(req.body);

    // Get application
    const application = await getApplicationById(id);

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found',
      });
      return;
    }

    // Update application status
    const updatedApplication = await updateApplicationStatus(id, validatedData.status as ApplicationStatus);

    // Send email notification
    await sendApplicationStatusEmail(updatedApplication);

    // If approved, create user account with temporary password
    if (validatedData.status === ApplicationStatus.APPROVED) {
      const tempPassword = generateTemporaryPassword();

      await createUserFromApplication(id, tempPassword);

      // Send account creation email
      await sendAccountCreationEmail(
        updatedApplication.email,
        updatedApplication.fullName,
        tempPassword,
      );
    }

    res.status(200).json({
      success: true,
      message: `Application ${validatedData.status.toLowerCase()} successfully`,
      data: {
        id: updatedApplication.id,
        status: updatedApplication.status,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
    });
  }
};
