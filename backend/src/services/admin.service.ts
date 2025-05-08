import { PrismaClient, UserRole, ApplicationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendAdminPasswordResetVerificationEmail, sendAdminWelcomeEmail } from './email.service';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';
import redisClient from '@/config/redis';
import generateVerificationCode from '@/utils/generateVerificationCode';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Create a new admin
export async function createAdmin(
  email: string,
  password: string,
  fullName: string,
  adminCreationSecret: string,
) {
  try {
    logger.info('Starting admin creation process', { email, fullName });

    // Verify admin creation secret
    if (adminCreationSecret !== process.env.ADMIN_CREATION_SECRET) {
      logger.warn('Invalid admin creation secret attempt', { email });
      throw new AppError('Invalid admin creation secret', 401, ErrorTypes.AUTHENTICATION);
    }

    // Check if admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { admin: true },
    });

    if (existingUser?.admin) {
      logger.warn('Admin creation failed - email already exists as admin', { email });
      throw new AppError('Admin with this email already exists', 400, ErrorTypes.DUPLICATE);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and admin in a transaction
    logger.info('Creating admin in database transaction', { email });
    const { user, admin } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: UserRole.ADMIN,
        },
      });

      const admin = await tx.admin.create({
        data: {
          fullName,
          user: {
            connect: { id: user.id },
          },
        },
      });

      return { user, admin };
    });

    logger.info('Admin created successfully', { adminId: admin.id, email });

    // Send welcome email without blocking the admin creation process
    sendAdminWelcomeEmail(email, fullName).catch((emailError) => {
      logger.error('Failed to send admin welcome email', {
        adminId: admin.id,
        email,
        error: emailError instanceof Error ? emailError.message : String(emailError),
      });
    });

    return {
      id: admin.id,
      email: user.email,
      fullName: admin.fullName,
      role: user.role,
    };
  } catch (error) {
    logger.error('Error in createAdmin', {
      email,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Login an admin
export async function loginAdmin(email: string, password: string) {
  try {
    logger.info('Admin login attempt', { email });

    const user = await prisma.user.findUnique({
      where: { email },
      include: { admin: true },
    });

    if (!user || user.role !== UserRole.ADMIN || !user.admin?.id) {
      logger.warn('Admin login failed - invalid credentials', { email });
      throw new AppError('Invalid credentials', 401, ErrorTypes.AUTHENTICATION);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn('Admin login failed - invalid password', { email });
      throw new AppError('Invalid credentials', 401, ErrorTypes.AUTHENTICATION);
    }

    logger.info('Admin login successful', { adminId: user.admin.id, email });

    return {
      id: user.admin.id,
      userId: user.id,
      email: user.email,
      fullName: user.admin.fullName,
      role: user.role,
    };
  } catch (error) {
    logger.error('Error in loginAdmin', {
      email,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get admin profile by user ID
export async function getAdminProfileById(userId: string) {
  try {
    logger.info('Fetching admin profile', { userId });

    // Find the admin record that corresponds to this user ID
    const admin = await prisma.admin.findFirst({
      where: { userId: userId },
      include: {
        user: true,
      },
    });

    if (!admin || admin.user.role !== UserRole.ADMIN) {
      logger.warn('Admin profile fetch failed - admin not found', { userId });
      throw new AppError('Admin not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Get admin statistics
    const coursesCreated = await prisma.course.count({
      where: { adminId: admin.id },
    });

    const chaptersCreated = await prisma.chapter.count({
      where: { adminId: admin.id },
    });

    const examsCreated = await prisma.exam.count({
      where: { adminId: admin.id },
    });

    const applicationsReviewed = await prisma.application.count({
      where: { adminId: admin.id },
    });

    logger.info('Admin profile retrieved successfully', { adminId: admin.id });

    return {
      id: admin.id,
      email: admin.user.email,
      fullName: admin.fullName,
      role: admin.user.role,
      createdAt: admin.createdAt,
      statistics: {
        coursesCreated,
        chaptersCreated,
        examsCreated,
        applicationsReviewed,
      },
    };
  } catch (error) {
    logger.error('Error in getAdminProfileById', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// get all students
export async function getAllStudentsWithSearch(
  search?: string,
  page: number = 1,
  limit: number = 10,
) {
  try {
    logger.info('Fetching all students', { search: search || 'none', page, limit });

    const skip = (page - 1) * limit;

    const whereClause = search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { phoneNumber: { contains: search, mode: 'insensitive' as const } },
            { user: { email: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where: whereClause,
        select: {
          id: true,
          fullName: true,
          gender: true,
          phoneNumber: true,
          user: {
            select: {
              email: true,
            },
          },
        },
        orderBy: { fullName: 'asc' },
        skip,
        take: limit,
      }),
      prisma.student.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      students: students.map((student) => ({
        id: student.id,
        fullName: student.fullName,
        gender: student.gender,
        phoneNumber: student.phoneNumber,
        email: student.user.email,
      })),
      total,
      totalPages,
    };
  } catch (error) {
    logger.error('Error in getAllStudentsWithSearch', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Initiate password reset
export async function initiatePasswordReset(
  userId: string,
  oldPassword: string,
  newPassword: string,
) {
  try {
    logger.info('Initiating password reset process', { userId });

    // Find the admin by userId
    const admin = await prisma.admin.findFirst({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!admin || admin.user.role !== UserRole.ADMIN) {
      logger.warn('Password reset failed - admin not found', { userId });
      throw new AppError('Admin not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Verify the old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, admin.user.password);
    if (!isOldPasswordValid) {
      logger.warn('Password reset failed - invalid old password', { userId });
      throw new AppError('Invalid old password', 401, ErrorTypes.AUTHENTICATION);
    }

    // Hash the new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Generate a verification code
    const verificationCode = generateVerificationCode(8);

    // Generate a unique reset ID
    const resetId = crypto.randomUUID();

    // Store the reset request in Redis (with 30 minute expiration)
    const resetData = {
      userId,
      newPasswordHash,
      verificationCode,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };

    await redisClient.set(
      `password_reset:${resetId}`,
      JSON.stringify(resetData),
      { EX: 1800 }, // 30 minutes in seconds
    );

    // Send verification code via email
    await sendAdminPasswordResetVerificationEmail(
      admin.user.email,
      admin.fullName,
      verificationCode,
    );

    logger.info('Password reset initiated successfully', { userId, resetId });

    return { resetId };
  } catch (error) {
    logger.error('Error in initiatePasswordReset', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Complete password reset
export async function completePasswordReset(
  userId: string,
  resetId: string,
  verificationCode: string,
) {
  try {
    logger.info('Completing password reset', { userId, resetId });

    // Get reset data from Redis
    const resetDataJson = await redisClient.get(`password_reset:${resetId}`);

    if (!resetDataJson) {
      logger.warn('Password reset completion failed - invalid or expired reset ID', {
        userId,
        resetId,
      });
      throw new AppError('Invalid or expired reset request', 400, ErrorTypes.VALIDATION);
    }

    const resetData = JSON.parse(resetDataJson);

    // Verify this reset belongs to the current user
    if (resetData.userId !== userId) {
      logger.warn('Password reset completion failed - user ID mismatch', { userId, resetId });
      throw new AppError('Invalid reset request', 400, ErrorTypes.VALIDATION);
    }

    // Check if reset request has expired (additional check even though Redis handles expiration)
    if (new Date() > new Date(resetData.expiresAt)) {
      // Clean up expired request
      await redisClient.del(`password_reset:${resetId}`);
      logger.warn('Password reset completion failed - request expired', { userId, resetId });
      throw new AppError('Reset request has expired', 400, ErrorTypes.VALIDATION);
    }

    // Verify the verification code
    if (resetData.verificationCode !== verificationCode) {
      logger.warn('Password reset completion failed - invalid verification code', {
        userId,
        resetId,
      });
      throw new AppError('Invalid verification code', 400, ErrorTypes.VALIDATION);
    }

    // Update the password in the database
    await prisma.user.update({
      where: { id: userId },
      data: { password: resetData.newPasswordHash },
    });

    // Clean up the reset request from Redis
    await redisClient.del(`password_reset:${resetId}`);

    logger.info('Password reset completed successfully', { userId });

    return { success: true };
  } catch (error) {
    logger.error('Error in completePasswordReset', {
      userId,
      resetId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Update application status
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
