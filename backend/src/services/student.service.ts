// src/services/student.service.ts
import { PrismaClient, Gender, ApplicationStatus, UserRole } from '@prisma/client';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';
import { uploadToCloudinary } from '../utils/cloudinary';
import { sendApplicationConfirmationEmail } from './email.service';

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
    logger.info('Starting student registration process', { email, fullName });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.warn('Student registration failed - email already exists', { email });
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
        logger.info('Certificate uploaded successfully', { email });
      } catch (uploadError) {
        logger.error('Failed to upload certificate', {
          email,
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
        logger.info('Recommendation letter uploaded successfully', { email });
      } catch (uploadError) {
        logger.error('Failed to upload recommendation letter', {
          email,
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
            email,
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
        email,
        error: txError instanceof Error ? txError.message : String(txError),
      });
      throw new AppError('Failed to register student', 500, ErrorTypes.SERVER);
    }

    logger.info('Student registered successfully', {
      studentId: student.id,
      applicationId: application.id,
      email,
    });

    // Send confirmation email without blocking the registration process
    sendApplicationConfirmationEmail(email, fullName, application.id).catch((emailError) => {
      logger.error('Failed to send application confirmation email', {
        studentId: student.id,
        email,
        error: emailError instanceof Error ? emailError.message : String(emailError),
      });
    });

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
