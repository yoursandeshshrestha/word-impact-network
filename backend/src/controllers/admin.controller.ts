import { Request, Response } from 'express';
import {
  completePasswordReset,
  createAdmin,
  getAdminDashboardStats,
  getAdminProfileById,
  getAllStudentsWithSearch,
  initiatePasswordReset,
  loginAdmin,
} from '../services/admin.service';
import { generateToken } from '../utils/jwt';
import { sendSuccess } from '../utils/responseHandler';
import { catchAsync } from '../utils/catchAsync';
import { ErrorTypes } from '@/utils/appError';
import { AppError } from '@/utils/appError';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Register a new admin
export const registerAdmin = catchAsync(async (req: Request, res: Response) => {
  const { email, password, fullName, adminCreationSecret } = req.body;

  const admin = await createAdmin(email, password, fullName, adminCreationSecret);

  sendSuccess(res, 201, 'Admin created successfully', {
    id: admin.id,
    email: admin.email,
    fullName: admin.fullName,
    role: admin.role,
  });
});

// Login an admin
export const loginAdminController = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const admin = await loginAdmin(email, password);
  const token = generateToken({
    userId: admin.userId,
    email: admin.email,
    role: admin.role,
  });

  sendSuccess(res, 200, 'Login successful', {
    admin: {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
    },
    token,
  });
});

// Get admin profile
export const getAdminProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const userId = req.user.userId;
  const adminProfile = await getAdminProfileById(userId);

  sendSuccess(res, 200, 'Admin profile retrieved successfully', adminProfile);
});

// Request password reset
export const requestPasswordReset = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { oldPassword, newPassword } = req.body;

  if (!userId) {
    throw new AppError('User ID is required', 400, ErrorTypes.VALIDATION);
  }

  // Validate password requirements
  if (newPassword.length < 8) {
    throw new AppError(
      'New password must be at least 8 characters long',
      400,
      ErrorTypes.VALIDATION,
    );
  }

  // Request the password reset and send email with secret code
  const resetData = await initiatePasswordReset(userId, oldPassword, newPassword);

  sendSuccess(res, 200, 'Password reset verification code sent to your email', {
    message: 'Please check your email for the verification code',
    resetId: resetData.resetId,
  });
});

// Verify password reset
export const verifyPasswordReset = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { resetId, verificationCode } = req.body;

  if (!userId) {
    throw new AppError('User ID is required', 400, ErrorTypes.VALIDATION);
  }

  if (!resetId || !verificationCode) {
    throw new AppError('Reset ID and verification code are required', 400, ErrorTypes.VALIDATION);
  }

  // Complete the password reset
  await completePasswordReset(userId, resetId, verificationCode);

  sendSuccess(res, 200, 'Password reset successful', {
    message: 'Your password has been updated successfully',
  });
});

// get all students
export const getAllStudentsController = catchAsync(async (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '10', 10);

  const { students, total, totalPages } = await getAllStudentsWithSearch(search, page, limit);

  // Get detailed information for each student
  const studentsWithDetails = await Promise.all(
    students.map(async (student) => {
      // Get course enrollments
      const enrollments = await prisma.courseEnrollment.findMany({
        where: { studentId: student.id },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              durationYears: true,
            },
          },
        },
      });

      // Get chapter progress
      const chapterProgress = await prisma.chapterProgress.findMany({
        where: { studentId: student.id },
        select: {
          isCompleted: true,
          chapter: {
            select: {
              courseId: true,
            },
          },
        },
      });

      // Get exam attempts
      const examAttempts = await prisma.examAttempt.findMany({
        where: { studentId: student.id },
        select: {
          isPassed: true,
          exam: {
            select: {
              chapter: {
                select: {
                  courseId: true,
                },
              },
            },
          },
        },
      });

      // Calculate progress metrics
      const coursesEnrolled = enrollments.length;
      const chaptersCompleted = chapterProgress.filter((progress) => progress.isCompleted).length;
      const examsCompleted = examAttempts.length;
      const examsPassed = examAttempts.filter((attempt) => attempt.isPassed).length;

      // Calculate course-wise progress
      const courseProgress = enrollments.map((enrollment) => {
        const courseChapters = chapterProgress.filter(
          (progress) => progress.chapter.courseId === enrollment.courseId,
        );
        const completedChapters = courseChapters.filter((progress) => progress.isCompleted).length;
        const courseExams = examAttempts.filter(
          (attempt) => attempt.exam.chapter.courseId === enrollment.courseId,
        );
        const passedExams = courseExams.filter((attempt) => attempt.isPassed).length;

        return {
          courseId: enrollment.course.id,
          courseTitle: enrollment.course.title,
          durationYears: enrollment.course.durationYears,
          enrollmentDate: enrollment.enrollmentDate,
          progress: {
            chaptersCompleted,
            totalChapters: courseChapters.length,
            examsPassed,
            totalExams: courseExams.length,
          },
        };
      });

      return {
        ...student,
        statistics: {
          coursesEnrolled,
          chaptersCompleted,
          examsCompleted,
          examsPassed,
        },
        courseProgress,
      };
    }),
  );

  sendSuccess(res, 200, 'Students retrieved successfully', {
    students: studentsWithDetails,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      limit,
    },
  });
});

// Get admin dashboard statistics
export const getAdminDashboard = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  // Get dashboard statistics
  const dashboardStats = await getAdminDashboardStats();

  sendSuccess(res, 200, 'Dashboard statistics retrieved successfully', dashboardStats);
});
