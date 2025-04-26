// src/services/application.service.ts
import { PrismaClient, ApplicationStatus, UserRole } from '@prisma/client';
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
      applicationId: app.id,
      email: app.email,
      fullName: app.fullName,
      gender: app.gender,
      dateOfBirth: app.dateOfBirth,
      phoneNumber: app.phoneNumber,
      country: app.country,
      academicQualification: app.academicQualification,
      desiredDegree: app.desiredDegree,
      certificateUrl: app.certificateUrl,
      recommendationLetterUrl: app.recommendationLetterUrl,
      referredBy: app.referredBy,
      referrerContact: app.referrerContact,
      agreesToTerms: app.agreesToTerms,
      status: app.status,
      appliedAt: app.appliedAt,
      reviewedAt: app.reviewedAt,
      rejectionReason: app.rejectionReason,
      studentId: app.studentId,
      adminId: app.adminId,
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
        student: true,
        reviewedBy: true,
      },
    });

    if (!application) {
      logger.warn('Update application status failed - application not found', {
        applicationId,
      });
      throw new AppError('Application not found', 404, ErrorTypes.NOT_FOUND);
    }

    // If rejecting, ensure a reason is provided
    if (status === ApplicationStatus.REJECTED && !rejectionReason) {
      logger.warn('Rejection reason not provided', { applicationId });
      throw new AppError('Rejection reason is required', 400, ErrorTypes.VALIDATION);
    }

    // Update application status and create user/student if approved
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
        select: {
          id: true,
          email: true,
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
          agreesToTerms: true,
          status: true,
          reviewedAt: true,
          rejectionReason: true,
          student: true,
          reviewedBy: true,
        },
      });

      // If approved and no student exists, create user and student
      if (status === ApplicationStatus.APPROVED && !application.student) {
        const tempPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Create user
        const user = await tx.user.create({
          data: {
            email: updatedApp.email,
            password: hashedPassword,
            role: UserRole.STUDENT,
          },
        });

        // Create student
        const student = await tx.student.create({
          data: {
            userId: user.id,
            fullName: updatedApp.fullName,
            gender: updatedApp.gender,
            dateOfBirth: updatedApp.dateOfBirth,
            phoneNumber: updatedApp.phoneNumber,
            country: updatedApp.country,
            academicQualification: updatedApp.academicQualification,
            desiredDegree: updatedApp.desiredDegree,
            certificateUrl: updatedApp.certificateUrl,
            recommendationLetterUrl: updatedApp.recommendationLetterUrl,
            referredBy: updatedApp.referredBy,
            referrerContact: updatedApp.referrerContact,
            agreesToTerms: updatedApp.agreesToTerms,
            applicationStatus: status, // Set initial application status
          },
        });

        // Link student to application
        await tx.application.update({
          where: { id: applicationId },
          data: {
            student: {
              connect: { id: student.id },
            },
          },
        });

        // Send approval email
        await sendApplicationApprovedEmail(
          updatedApp.email,
          updatedApp.fullName,
          tempPassword,
        ).catch((emailError) => {
          logger.error('Failed to send application approval email', {
            applicationId,
            email: updatedApp.email,
            error: emailError instanceof Error ? emailError.message : String(emailError),
          });
        });
      } else if (application.student) {
        // Update existing student's application status
        await tx.student.update({
          where: { id: application.student.id },
          data: {
            applicationStatus: status,
          },
        });
      } else if (status === ApplicationStatus.REJECTED && rejectionReason) {
        // Send rejection email
        sendApplicationRejectedEmail(updatedApp.email, updatedApp.fullName, rejectionReason).catch(
          (emailError) => {
            logger.error('Failed to send application rejection email', {
              applicationId,
              email: updatedApp.email,
              error: emailError instanceof Error ? emailError.message : String(emailError),
            });
          },
        );
      }

      return updatedApp;
    });

    logger.info('Application status updated successfully', {
      applicationId,
      status,
    });

    return {
      id: updatedApplication.id,
      status: updatedApplication.status,
      email: updatedApplication.email,
      fullName: updatedApplication.fullName,
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
