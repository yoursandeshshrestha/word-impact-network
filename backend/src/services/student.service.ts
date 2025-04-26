// src/services/student.service.ts
import { PrismaClient, Gender, ApplicationStatus, UserRole } from '@prisma/client';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';
import { uploadToCloudinary } from '../utils/cloudinary';
import { sendApplicationConfirmationEmail } from './email.service';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

/**
 * Register a new student
 */
export async function registerStudent(
  email: string,
  fullName: string,
  gender: Gender,
  dateOfBirth: Date,
  phoneNumber: string,
  country: string,
  academicQualification: string,
  desiredDegree: string,
  certificateFile?: Express.Multer.File,
  recommendationLetterFile?: Express.Multer.File,
  referredBy?: string,
  referrerContact?: string,
  agreesToTerms: boolean = false,
) {
  try {
    const normalizedEmail = email.toLowerCase();
    logger.info('Application registration attempt', { email: normalizedEmail });

    // Check if application already exists
    const existingApplication = await prisma.application.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingApplication) {
      logger.warn('Application registration failed - email already exists', {
        email: normalizedEmail,
      });
      throw new AppError('Email already registered', 400, ErrorTypes.VALIDATION);
    }

    // Upload files if provided
    let certificateUrl: string | undefined;
    let recommendationLetterUrl: string | undefined;

    if (certificateFile) {
      certificateUrl = await uploadToCloudinary(certificateFile.buffer);
    }

    if (recommendationLetterFile) {
      recommendationLetterUrl = await uploadToCloudinary(recommendationLetterFile.buffer);
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        email: normalizedEmail,
        fullName,
        gender,
        dateOfBirth,
        phoneNumber,
        country,
        academicQualification,
        desiredDegree,
        certificateUrl,
        recommendationLetterUrl,
        referredBy,
        referrerContact,
        agreesToTerms,
        status: ApplicationStatus.PENDING,
      },
    });

    logger.info('Application created successfully', {
      applicationId: application.id,
      email: normalizedEmail,
    });

    // Send confirmation email
    sendApplicationConfirmationEmail(normalizedEmail, fullName, application.id).catch(
      (emailError) => {
        logger.error('Failed to send application confirmation email', {
          applicationId: application.id,
          email: normalizedEmail,
          error: emailError instanceof Error ? emailError.message : String(emailError),
        });
      },
    );

    return {
      id: application.id,
      email: normalizedEmail,
      fullName,
      applicationStatus: application.status,
    };
  } catch (error) {
    logger.error('Error in registerStudent', {
      email,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  adminId: string,
  status: ApplicationStatus,
  rejectionReason?: string,
) {
  try {
    logger.info('Updating application status', { applicationId, status });

    // Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new AppError('Admin not found', 404, ErrorTypes.NOT_FOUND);
    }

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
      throw new AppError('Application not found', 404, ErrorTypes.NOT_FOUND);
    }

    const updatedApplication = await prisma.application.update({
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

    logger.info('Application status updated successfully', {
      applicationId,
      status,
      studentId: updatedApplication.student?.id,
    });

    return updatedApplication;
  } catch (error) {
    logger.error('Error updating application status', {
      applicationId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Login a student
 */
export async function loginStudent(email: string, password: string) {
  try {
    // Convert email to lowercase
    const normalizedEmail = email.toLowerCase();
    logger.info('Student login attempt', { email: normalizedEmail });

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        student: {
          include: {
            application: true,
          },
        },
      },
    });

    // Check if user exists and is a student
    if (!user || user.role !== UserRole.STUDENT || !user.student) {
      logger.warn('Student login failed - invalid credentials', { email });
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn('Student login failed - invalid password', { email });
      throw new AppError('Invalid email or password', 401);
    }

    // Check if student's application is approved
    if (user.student.applicationStatus !== ApplicationStatus.APPROVED) {
      logger.warn('Student login failed - application not approved', {
        email,
        applicationStatus: user.student.applicationStatus,
      });

      // Different message based on application status
      if (user.student.applicationStatus === ApplicationStatus.PENDING) {
        throw new AppError(
          'Your application is still pending approval. Please wait for admin review.',
          403,
        );
      } else if (user.student.applicationStatus === ApplicationStatus.REJECTED) {
        throw new AppError(
          'Your application has been rejected. Please check your email for details.',
          403,
        );
      } else {
        throw new AppError('Your account is not active. Please contact support.', 403);
      }
    }

    logger.info('Student login successful', {
      studentId: user.student.id,
      email: user.email,
    });

    return {
      id: user.student.id,
      userId: user.id,
      email: user.email,
      fullName: user.student.fullName,
      role: user.role,
      applicationStatus: user.student.applicationStatus,
    };
  } catch (error) {
    logger.error('Error in loginStudent', {
      email,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
