import { Request, Response } from 'express';
import {
  enrollStudentInCourse,
  getChapterProgress,
  getExamDetails,
  getStudentEnrolledCourses,
  getStudentLearningProgress,
  getStudentProfileByUserId,
  loginStudent,
  registerStudent as registerStudentService,
  updateStudentProfileByUserId,
  updateVideoProgress,
} from '../services/student.service';
import { sendSuccess } from '../utils/responseHandler';
import { catchAsync } from '../utils/catchAsync';
import { ApplicationStatus, Gender, PaymentStatus } from '@prisma/client';
import { generateToken } from '@/utils/jwt';
import { ErrorTypes } from '@/utils/appError';
import { AppError } from '@/utils/appError';
import { logger } from '@/utils/logger';
import prisma from '@/config/prisma';

// Register a new student
export const registerStudent = catchAsync(async (req: Request, res: Response) => {
  const {
    email,
    fullName,
    gender,
    dateOfBirth,
    phoneNumber,
    country,
    academicQualification,
    desiredDegree,
    referredBy,
    referrerContact,
    agreesToTerms,
  } = req.body;

  // Get files if they exist
  const files = req.files as
    | {
        [fieldname: string]: Express.Multer.File[];
      }
    | undefined;

  // Extract files if they exist
  const certificateFile = files?.certificate?.[0];
  const recommendationLetterFile = files?.recommendationLetter?.[0];

  const student = await registerStudentService(
    email,
    fullName,
    gender as Gender,
    new Date(dateOfBirth),
    phoneNumber,
    country,
    academicQualification,
    desiredDegree,
    certificateFile,
    recommendationLetterFile,
    referredBy,
    referrerContact,
    agreesToTerms === 'true' || agreesToTerms === true,
  );

  sendSuccess(res, 201, 'Student registered successfully. Your application is pending approval.', {
    id: student.id,
    email: student.email,
    fullName: student.fullName,
    applicationStatus: student.applicationStatus,
  });
});

// Login a student
export const loginStudentController = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const student = await loginStudent(email, password);

  // Generate JWT token
  const token = generateToken({
    userId: student.userId,
    email: student.email,
    role: student.role,
  });

  sendSuccess(res, 200, 'Login successful', {
    student: {
      id: student.id,
      email: student.email,
      fullName: student.fullName,
      role: student.role,
      applicationStatus: student.applicationStatus,
    },
    token,
  });
});

// Get student profile
export const getStudentProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    logger.error('User ID is required');
    throw new AppError('User ID is required', 400, ErrorTypes.VALIDATION);
  }

  const studentProfile = await getStudentProfileByUserId(userId);

  sendSuccess(res, 200, 'Student profile retrieved successfully', studentProfile);
});

// Update student profile
export const updateStudentProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('User ID is required', 400, ErrorTypes.VALIDATION);
  }

  const { fullName, phoneNumber, country, dateOfBirth, gender } = req.body;

  // Parse dateOfBirth if provided
  let parsedDateOfBirth: Date | undefined = undefined;
  if (dateOfBirth) {
    parsedDateOfBirth = new Date(dateOfBirth);

    // Check if date is valid
    if (isNaN(parsedDateOfBirth.getTime())) {
      throw new AppError('Invalid date format for date of birth', 400, ErrorTypes.VALIDATION);
    }
  }

  // Update the profile with only the allowed fields
  const updatedProfile = await updateStudentProfileByUserId(userId, {
    fullName,
    phoneNumber,
    country,
    dateOfBirth: parsedDateOfBirth,
    gender,
  });

  sendSuccess(res, 200, 'Student profile updated successfully', updatedProfile);
});

// Get student's enrolled courses
export const getCourses = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated and get userId
  if (!req.user || !req.user.userId) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  // First find the student ID from the user ID
  const student = await prisma.student.findFirst({
    where: { userId: req.user.userId },
  });

  if (!student) {
    logger.warn('Student not found for user', { userId: req.user.userId });
    throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
  }

  // Get enrolled courses using the student ID
  const coursesData = await getStudentEnrolledCourses(student.id);

  sendSuccess(res, 200, 'Courses retrieved successfully', coursesData);
});

// Enroll student in a course
export const enrollInCourse = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated and get userId
  if (!req.user || !req.user.userId) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const { courseId } = req.params;

  // Validate courseId
  if (!courseId) {
    throw new AppError('Course ID is required', 400, ErrorTypes.VALIDATION);
  }

  // First find the student ID from the user ID
  const student = await prisma.student.findFirst({
    where: { userId: req.user.userId },
  });

  if (!student) {
    logger.warn('Student not found for user', { userId: req.user.userId });
    throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
  }

  // Ensure student's application is approved
  if (student.applicationStatus !== ApplicationStatus.APPROVED) {
    logger.warn('Enrollment failed - student application not approved', {
      studentId: student.id,
      applicationStatus: student.applicationStatus,
    });

    let errorMessage = 'Your application needs to be approved before enrolling in courses';

    if (student.applicationStatus === ApplicationStatus.REJECTED) {
      errorMessage = 'Your application has been rejected. Please contact support.';
    }

    throw new AppError(errorMessage, 403, ErrorTypes.AUTHORIZATION);
  }

  // // Check payment status if needed (can be expanded based on your payment requirements)
  // if (student.paymentStatus !== PaymentStatus.PAID) {
  //   logger.warn('Enrollment failed - payment pending', {
  //     studentId: student.id,
  //     paymentStatus: student.paymentStatus,
  //   });
  //   throw new AppError(
  //     'Please complete your payment before enrolling in courses',
  //     403,
  //     ErrorTypes.AUTHORIZATION,
  //   );
  // }

  // Enroll student in the course
  const enrollmentResult = await enrollStudentInCourse(student.id, courseId);

  // Different message based on whether it's a new enrollment or reactivation
  const message = enrollmentResult.isNewEnrollment
    ? 'Successfully enrolled in the course'
    : 'Successfully reactivated your enrollment in the course';

  sendSuccess(res, 201, message, enrollmentResult.enrollment);
});

// Get student's overall learning progress
export const getStudentProgress = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated and get userId
  if (!req.user || !req.user.userId) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  // First find the student ID from the user ID
  const student = await prisma.student.findFirst({
    where: { userId: req.user.userId },
  });

  if (!student) {
    logger.warn('Student not found for user', { userId: req.user.userId });
    throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
  }

  // Ensure student's application is approved
  if (student.applicationStatus !== ApplicationStatus.APPROVED) {
    logger.warn('Progress fetch failed - student application not approved', {
      studentId: student.id,
      applicationStatus: student.applicationStatus,
    });

    let errorMessage = 'Your application needs to be approved to access progress data';

    if (student.applicationStatus === ApplicationStatus.REJECTED) {
      errorMessage = 'Your application has been rejected. Please contact support.';
    }

    throw new AppError(errorMessage, 403, ErrorTypes.AUTHORIZATION);
  }

  // Get learning progress
  const progressData = await getStudentLearningProgress(student.id);

  sendSuccess(res, 200, 'Learning progress retrieved successfully', progressData);
});

// Get student's progress for a specific chapter
export const getStudentChapterProgress = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated and get userId
  if (!req.user || !req.user.userId) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const { chapterId } = req.params;

  // Validate chapterId
  if (!chapterId) {
    throw new AppError('Chapter ID is required', 400, ErrorTypes.VALIDATION);
  }

  // First find the student ID from the user ID
  const student = await prisma.student.findFirst({
    where: { userId: req.user.userId },
  });

  if (!student) {
    logger.warn('Student not found for user', { userId: req.user.userId });
    throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
  }

  // Ensure student's application is approved
  if (student.applicationStatus !== ApplicationStatus.APPROVED) {
    logger.warn('Chapter progress fetch failed - student application not approved', {
      studentId: student.id,
      applicationStatus: student.applicationStatus,
    });

    let errorMessage = 'Your application needs to be approved to access course content';

    if (student.applicationStatus === ApplicationStatus.REJECTED) {
      errorMessage = 'Your application has been rejected. Please contact support.';
    }

    throw new AppError(errorMessage, 403, ErrorTypes.AUTHORIZATION);
  }

  // Get chapter progress
  const progressData = await getChapterProgress(student.id, chapterId);

  sendSuccess(res, 200, 'Chapter progress retrieved successfully', progressData);
});

// Update video watching progress
export const updateStudentVideoProgress = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated and get userId
  if (!req.user || !req.user.userId) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const { videoId } = req.params;
  const { watchedPercent } = req.body;

  // Validate videoId
  if (!videoId) {
    throw new AppError('Video ID is required', 400, ErrorTypes.VALIDATION);
  }

  // Validate watchedPercent
  if (watchedPercent === undefined || watchedPercent === null) {
    throw new AppError('Watched percent is required', 400, ErrorTypes.VALIDATION);
  }

  // Convert to number if string
  const watchedPercentNum =
    typeof watchedPercent === 'string' ? parseInt(watchedPercent, 10) : watchedPercent;

  // Check if watchedPercent is a valid number
  if (isNaN(watchedPercentNum) || !Number.isInteger(watchedPercentNum)) {
    throw new AppError('Watched percent must be an integer', 400, ErrorTypes.VALIDATION);
  }

  // Check range
  if (watchedPercentNum < 0 || watchedPercentNum > 100) {
    throw new AppError('Watched percent must be between 0 and 100', 400, ErrorTypes.VALIDATION);
  }

  // First find the student ID from the user ID
  const student = await prisma.student.findFirst({
    where: { userId: req.user.userId },
  });

  if (!student) {
    logger.warn('Student not found for user', { userId: req.user.userId });
    throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
  }

  // Ensure student's application is approved
  if (student.applicationStatus !== ApplicationStatus.APPROVED) {
    logger.warn('Video progress update failed - student application not approved', {
      studentId: student.id,
      applicationStatus: student.applicationStatus,
    });

    let errorMessage = 'Your application needs to be approved to access course content';

    if (student.applicationStatus === ApplicationStatus.REJECTED) {
      errorMessage = 'Your application has been rejected. Please contact support.';
    }

    throw new AppError(errorMessage, 403, ErrorTypes.AUTHORIZATION);
  }

  // Update video progress
  const progressData = await updateVideoProgress(student.id, videoId, watchedPercentNum);

  sendSuccess(res, 200, 'Video progress updated successfully', progressData);
});

// Get exam details for a student
export const getStudentExamDetails = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated and get userId
  if (!req.user || !req.user.userId) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const { examId } = req.params;

  // Validate examId
  if (!examId) {
    throw new AppError('Exam ID is required', 400, ErrorTypes.VALIDATION);
  }

  // First find the student ID from the user ID
  const student = await prisma.student.findFirst({
    where: { userId: req.user.userId },
  });

  if (!student) {
    logger.warn('Student not found for user', { userId: req.user.userId });
    throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
  }

  // Ensure student's application is approved
  if (student.applicationStatus !== ApplicationStatus.APPROVED) {
    logger.warn('Exam details fetch failed - student application not approved', {
      studentId: student.id,
      applicationStatus: student.applicationStatus,
    });

    let errorMessage = 'Your application needs to be approved to access course content';

    if (student.applicationStatus === ApplicationStatus.REJECTED) {
      errorMessage = 'Your application has been rejected. Please contact support.';
    }

    throw new AppError(errorMessage, 403, ErrorTypes.AUTHORIZATION);
  }

  // Get exam details
  const examData = await getExamDetails(student.id, examId);

  sendSuccess(res, 200, 'Exam details retrieved successfully', examData);
});
