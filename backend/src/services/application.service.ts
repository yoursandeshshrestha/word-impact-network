// src/services/application.service.ts
import { PrismaClient, ApplicationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';
import { sendApplicationApprovedEmail, sendApplicationRejectedEmail } from './email.service';

const prisma = new PrismaClient();

/**
 * Get all applications with pagination and filtering
 */
export async function getAllApplications(
  status?: ApplicationStatus,
  page: number = 1,
  limit: number = 10,
) {
  try {
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};
    if (status && Object.values(ApplicationStatus).includes(status)) {
      where.status = status;
    }

    // Get applications with student information
    const applications = await prisma.application.findMany({
      where,
      include: {
        student: {
          select: {
            fullName: true,
            phoneNumber: true,
            country: true,
            academicQualification: true,
            desiredDegree: true,
            certificateUrl: true,
            recommendationLetterUrl: true,
            applicationStatus: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        reviewedBy: {
          select: {
            fullName: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        appliedAt: 'desc',
      },
    });

    // Get total count for pagination
    const totalCount = await prisma.application.count({ where });

    const formattedApplications = applications.map((app) => ({
      applicationId: app.id, // Rename 'id' to 'applicationId' for clarity
      status: app.status,
      appliedAt: app.appliedAt,
      reviewedAt: app.reviewedAt,
      rejectionReason: app.rejectionReason,
      studentId: app.studentId,
      adminId: app.adminId,
      student: {
        fullName: app.student.fullName,
        phoneNumber: app.student.phoneNumber,
        country: app.student.country,
        academicQualification: app.student.academicQualification,
        desiredDegree: app.student.desiredDegree,
        certificateUrl: app.student.certificateUrl,
        recommendationLetterUrl: app.student.recommendationLetterUrl,
        applicationStatus: app.student.applicationStatus,
        user: {
          email: app.student.user.email,
        },
      },
      reviewedBy: app.reviewedBy,
    }));

    return {
      applications: formattedApplications,
      pagination: {
        current: page,
        limit: limit,
        total: Math.ceil(totalCount / limit),
        totalRecords: totalCount,
      },
    };
  } catch (error) {
    logger.error('Error in getAllApplications', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get application by ID
 */
export async function getApplicationById(id: string) {
  try {
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            gender: true,
            dateOfBirth: true,
            phoneNumber: true,
            country: true,
            academicQualification: true,
            desiredDegree: true,
            certificateUrl: true,
            recommendationLetterUrl: true,
            referredBy: true,
            referrerContact: true,
            applicationStatus: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        reviewedBy: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!application) {
      throw new AppError('Application not found', 404, ErrorTypes.NOT_FOUND);
    }

    return application;
  } catch (error) {
    logger.error('Error in getApplicationById', {
      id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Generate a random password
 */
function generateRandomPassword(length = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }

  return password;
}

/**
 * Update application status (admin action)
 */
export async function updateApplicationStatus(
  applicationId: string,
  adminId: string,
  status: ApplicationStatus,
  rejectionReason?: string,
) {
  try {
    logger.info('Updating application status', {
      applicationId,
      adminId,
      status,
    });

    // Check if application exists
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!application) {
      logger.warn('Update application status failed - application not found', {
        applicationId,
      });
      throw new AppError('Application not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if status is already set to the requested status
    if (application.status === status) {
      logger.info('Application status already set to requested status', {
        applicationId,
        status,
      });
      throw new AppError(
        `Application is already ${status.toLowerCase()}`,
        400,
        ErrorTypes.VALIDATION,
      );
    }

    // If rejecting, ensure a reason is provided
    if (status === ApplicationStatus.REJECTED && !rejectionReason) {
      logger.warn('Rejection reason not provided', { applicationId });
      throw new AppError('Rejection reason is required', 400, ErrorTypes.VALIDATION);
    }

    // Update application status
    const updatedApplication = await prisma.$transaction(async (tx) => {
      // Update application
      const updatedApp = await tx.application.update({
        where: { id: applicationId },
        data: {
          status,
          reviewedBy: {
            connect: { id: adminId },
          },
          reviewedAt: new Date(),
          rejectionReason: status === ApplicationStatus.REJECTED ? rejectionReason : null,
        },
        include: {
          student: {
            include: {
              user: true,
            },
          },
        },
      });

      // Update student application status
      await tx.student.update({
        where: { id: application.studentId },
        data: {
          applicationStatus: status,
        },
      });

      // If approved, create a temporary password for the student
      if (status === ApplicationStatus.APPROVED) {
        const tempPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Update user password
        await tx.user.update({
          where: { id: application.student.user.id },
          data: {
            password: hashedPassword,
          },
        });

        // Send approval email with temporary password
        sendApplicationApprovedEmail(
          application.student.user.email,
          application.student.fullName,
          tempPassword,
        ).catch((emailError) => {
          logger.error('Failed to send application approval email', {
            applicationId,
            studentId: application.studentId,
            email: application.student.user.email,
            error: emailError instanceof Error ? emailError.message : String(emailError),
          });
        });
      } else if (status === ApplicationStatus.REJECTED && rejectionReason) {
        // Send rejection email
        sendApplicationRejectedEmail(
          application.student.user.email,
          application.student.fullName,
          rejectionReason,
        ).catch((emailError) => {
          logger.error('Failed to send application rejection email', {
            applicationId,
            studentId: application.studentId,
            email: application.student.user.email,
            error: emailError instanceof Error ? emailError.message : String(emailError),
          });
        });
      }

      return updatedApp;
    });

    logger.info('Application status updated successfully', {
      applicationId,
      status,
      studentId: updatedApplication.studentId,
    });

    return {
      id: updatedApplication.id,
      status: updatedApplication.status,
      studentId: updatedApplication.studentId,
      studentName: updatedApplication.student.fullName,
      studentEmail: updatedApplication.student.user.email,
      reviewedAt: updatedApplication.reviewedAt,
      rejectionReason: updatedApplication.rejectionReason,
    };
  } catch (error) {
    logger.error('Error in updateApplicationStatus', {
      applicationId,
      adminId,
      status,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Delete application by ID
 */
export async function deleteApplication(id: string) {
  try {
    logger.info('Deleting application', { id });

    // Check if application exists
    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      logger.warn('Delete application failed - application not found', { id });
      throw new AppError('Application not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Delete the application
    await prisma.application.delete({
      where: { id },
    });

    logger.info('Application deleted successfully', { id });
    return { message: 'Application deleted successfully' };
  } catch (error) {
    logger.error('Error in deleteApplication', {
      id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
