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
    // Convert email to lowercase
    const normalizedEmail = email.toLowerCase();
    logger.info('Starting student registration process', { email: normalizedEmail, fullName });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      logger.warn('Student registration failed - email already exists', { email: normalizedEmail });
      throw new AppError('User with this email already exists', 400, ErrorTypes.DUPLICATE);
    }

    // Upload files to Cloudinary if provided
    let certificateUrl: string | undefined;
    let recommendationLetterUrl: string | undefined;

    if (certificateFile) {
      try {
        const randomId = Math.random().toString(36).substring(2, 8);
        const fileExtension = certificateFile.originalname?.split('.').pop() || 'pdf';
        const fileName = `${fullName.toLowerCase().replace(/\s+/g, '-')}-certificate-${randomId}.${fileExtension}`;
        certificateUrl = await uploadToCloudinary(
          certificateFile.buffer,
          'win/students/certificates',
          fileName,
        );
        logger.info('Certificate uploaded successfully', { email: normalizedEmail });
      } catch (uploadError) {
        logger.error('Failed to upload certificate', {
          email: normalizedEmail,
          error: uploadError instanceof Error ? uploadError.message : String(uploadError),
        });
      }
    }

    if (recommendationLetterFile) {
      try {
        const randomId = Math.random().toString(36).substring(2, 8);
        const fileExtension = recommendationLetterFile.originalname?.split('.').pop() || 'pdf';
        const fileName = `${fullName.toLowerCase().replace(/\s+/g, '-')}-recommendation-letter-${randomId}.${fileExtension}`;
        recommendationLetterUrl = await uploadToCloudinary(
          recommendationLetterFile.buffer,
          'win/students/recommendation_letters',
          fileName,
        );
        logger.info('Recommendation letter uploaded successfully', { email: normalizedEmail });
      } catch (uploadError) {
        logger.error('Failed to upload recommendation letter', {
          email: normalizedEmail,
          error: uploadError instanceof Error ? uploadError.message : String(uploadError),
        });
      }
    }

    let user;
    let student;
    let application;

    // Create user, student, and application in a transaction
    try {
      const result = await prisma.$transaction(async (prismaClient) => {
        // Create user with a placeholder password (will be set after approval)
        // Using a random string as a placeholder password
        const tempPassword = Math.random().toString(36).slice(-10);
        const newUser = await prismaClient.user.create({
          data: {
            email: normalizedEmail,
            password: tempPassword, // This will be updated after admin approval
            role: UserRole.STUDENT,
          },
        });

        // Create student
        const newStudent = await prismaClient.student.create({
          data: {
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
            user: {
              connect: { id: newUser.id },
            },
          },
        });

        // Create application
        const newApplication = await prismaClient.application.create({
          data: {
            student: {
              connect: { id: newStudent.id },
            },
            status: ApplicationStatus.PENDING,
          },
        });

        return {
          user: newUser,
          student: newStudent,
          application: newApplication,
        };
      });

      user = result.user;
      student = result.student;
      application = result.application;
    } catch (txError) {
      logger.error('Transaction failed during student registration', {
        email: normalizedEmail,
        error: txError instanceof Error ? txError.message : String(txError),
      });
      throw new AppError('Failed to register student', 500, ErrorTypes.SERVER);
    }

    logger.info('Student registered successfully', {
      studentId: student.id,
      applicationId: application.id,
      email: normalizedEmail,
    });

    // Send confirmation email without blocking the registration process
    sendApplicationConfirmationEmail(normalizedEmail, fullName, application.id).catch(
      (emailError) => {
        logger.error('Failed to send application confirmation email', {
          studentId: student.id,
          email: normalizedEmail,
          error: emailError instanceof Error ? emailError.message : String(emailError),
        });
      },
    );

    return {
      id: student.id,
      email: user.email,
      fullName: student.fullName,
      applicationId: application.id,
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
      studentId: updatedApplication.student.id,
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
