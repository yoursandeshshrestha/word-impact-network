import { Request, Response } from 'express';
import {
  enrollStudentInCourse,
  getChapterProgress,
  getEnrolledCourseContent,
  getExamAttemptResult,
  getExamDetails,
  getPreviewCourse,
  getStudentEnrolledCourses,
  getStudentLearningProgress,
  getStudentProfileByUserId,
  loginStudent,
  registerStudent as registerStudentService,
  startExamAttempt,
  submitExamAttempt,
  updateStudentProfileByUserId,
  updateVideoProgress,
  requestPasswordReset,
  completePasswordReset,
} from '../services/student.service';
import { sendError, sendSuccess } from '../utils/responseHandler';
import { catchAsync } from '../utils/catchAsync';
import { ApplicationStatus, Gender, PaymentStatus, UserRole } from '@prisma/client';
import { generateAccessToken } from '@/utils/jwt';
import { ErrorTypes } from '@/utils/appError';
import { AppError } from '@/utils/appError';
import { logger } from '@/utils/logger';
import prisma from '@/config/prisma';
import { createNotification } from '@/services/notification.service';
import { canAccessExam, canAccessVideo } from '@/utils/progressUtils';
import { clearFrontendAuthCookies } from '../utils/tokenUtils';

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

  // Create notifications for all admins
  try {
    // Find all admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: UserRole.ADMIN },
    });

    // Create a notification for each admin
    for (const admin of adminUsers) {
      await createNotification(
        admin.id,
        'New Student Registration',
        `${fullName} has submitted a new student application from ${country}.`,
        true, // Send as real-time notification
      );
    }
  } catch (error) {
    // Log error but don't fail the registration process
    logger.error('Failed to create admin notifications for new student', {
      studentId: student.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }

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
  const token = generateAccessToken({
    userId: student.userId,
    email: student.email,
    role: student.role,
  });

  // Generate refresh token
  const { generateRefreshToken } = await import('../utils/jwt');
  const { createRefreshToken } = await import('../services/refreshToken.service');

  const refreshTokenRecord = await createRefreshToken(student.userId);
  const refreshToken = generateRefreshToken(student.userId, refreshTokenRecord.tokenId);

  const isProduction = process.env.NODE_ENV === 'production';
  
  // Determine cookie domain for production
  const cookieDomain = isProduction ? '.wordimpactnetwork.org' : undefined;

  res.cookie('client-access-token-win', token, {
    httpOnly: false, // Allow JavaScript access for frontend
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
    domain: cookieDomain,
  });

  res.cookie('client-refresh-token-win', refreshToken, {
    httpOnly: false, // Allow JavaScript access for frontend
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
    domain: cookieDomain,
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

// Logout student
export const logoutStudent = catchAsync(async (req: Request, res: Response) => {
  // Check for frontend refresh token only
  const frontendRefreshToken = req.cookies['client-refresh-token-win'];

  // Revoke frontend refresh token if present
  if (frontendRefreshToken) {
    try {
      const { verifyRefreshToken } = await import('../utils/jwt');
      const { revokeRefreshToken } = await import('../services/refreshToken.service');

      // Verify and revoke refresh token
      const decoded = verifyRefreshToken(frontendRefreshToken);
      if (decoded) {
        await revokeRefreshToken(decoded.tokenId);
      }
    } catch (error) {
      // Continue with logout even if token revocation fails
      logger.warn('Failed to revoke frontend refresh token during logout', { error });
    }
  }

  // Clear only frontend authentication cookies
  clearFrontendAuthCookies(res);

  sendSuccess(res, 200, 'Logged out successfully');
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

  // Get profile picture file if it exists (using upload.single)
  const profilePictureFile = req.file;

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
  const updatedProfile = await updateStudentProfileByUserId(
    userId,
    {
      fullName,
      phoneNumber,
      country,
      dateOfBirth: parsedDateOfBirth,
      gender,
    },
    profilePictureFile,
  );

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

// Update video watching progress with access validation
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

  // Check if student can access this video (progressive unlocking)
  const accessCheck = await canAccessVideo(student.id, videoId);
  if (!accessCheck.canAccess) {
    logger.warn('Video access denied', {
      studentId: student.id,
      videoId,
      reason: accessCheck.reason,
    });
    throw new AppError(`Access denied: ${accessCheck.reason}`, 403, ErrorTypes.AUTHORIZATION);
  }

  // Update video progress
  const progressData = await updateVideoProgress(student.id, videoId, watchedPercentNum);

  sendSuccess(res, 200, 'Video progress updated successfully', {
    ...progressData,
    accessInfo: {
      canAccess: true,
      nextVideoUnlocked: watchedPercentNum === 100,
    },
  });
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

  // Check if student can access this exam (progressive unlocking)
  const accessCheck = await canAccessExam(student.id, examId);
  if (!accessCheck.canAccess) {
    logger.warn('Exam access denied', {
      studentId: student.id,
      examId,
      reason: accessCheck.reason,
    });
    throw new AppError(`Access denied: ${accessCheck.reason}`, 403, ErrorTypes.AUTHORIZATION);
  }

  // Get exam details
  const examData = await getExamDetails(student.id, examId);

  sendSuccess(res, 200, 'Exam details retrieved successfully', {
    ...examData,
    accessInfo: {
      canAccess: true,
      unlockedAt: new Date(),
    },
  });
});

// Start a new exam attempt
export const startStudentExamAttempt = catchAsync(async (req: Request, res: Response) => {
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
    logger.warn('Exam attempt failed - student application not approved', {
      studentId: student.id,
      applicationStatus: student.applicationStatus,
    });

    let errorMessage = 'Your application needs to be approved to access exams';

    if (student.applicationStatus === ApplicationStatus.REJECTED) {
      errorMessage = 'Your application has been rejected. Please contact support.';
    }

    throw new AppError(errorMessage, 403, ErrorTypes.AUTHORIZATION);
  }

  // Check if student can access this exam (progressive unlocking)
  const accessCheck = await canAccessExam(student.id, examId);
  if (!accessCheck.canAccess) {
    logger.warn('Exam attempt access denied', {
      studentId: student.id,
      examId,
      reason: accessCheck.reason,
    });
    throw new AppError(`Access denied: ${accessCheck.reason}`, 403, ErrorTypes.AUTHORIZATION);
  }

  // Start the exam attempt
  const attemptData = await startExamAttempt(student.id, examId);

  // Return different status code based on whether it's a new or ongoing attempt
  const statusCode = attemptData.isNewAttempt ? 201 : 200;

  sendSuccess(res, statusCode, attemptData.message, {
    ...attemptData,
    accessInfo: {
      canAccess: true,
      prerequisitesMet: true,
    },
  });
});

// Submit an exam attempt with answers
export const submitStudentExamAttempt = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated and get userId
  if (!req.user || !req.user.userId) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const { attemptId } = req.params;
  const { answers } = req.body;

  // Validate attemptId
  if (!attemptId) {
    throw new AppError('Attempt ID is required', 400, ErrorTypes.VALIDATION);
  }

  // Validate answers
  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    throw new AppError('Valid answers are required', 400, ErrorTypes.VALIDATION);
  }

  // Check if each answer has questionId and answer fields
  const invalidAnswers = answers.filter(
    (answer) => !answer.questionId || answer.answer === undefined || answer.answer === null,
  );

  if (invalidAnswers.length > 0) {
    throw new AppError(
      'Each answer must have questionId and answer fields',
      400,
      ErrorTypes.VALIDATION,
    );
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
    logger.warn('Exam submission failed - student application not approved', {
      studentId: student.id,
      applicationStatus: student.applicationStatus,
    });

    let errorMessage = 'Your application needs to be approved to submit exams';

    if (student.applicationStatus === ApplicationStatus.REJECTED) {
      errorMessage = 'Your application has been rejected. Please contact support.';
    }

    throw new AppError(errorMessage, 403, ErrorTypes.AUTHORIZATION);
  }

  // Submit the exam attempt
  const resultData = await submitExamAttempt(student.id, attemptId, answers);

  // Create success message based on pass/fail status
  const message = resultData.isPassed
    ? `Congratulations! You passed the exam with a score of ${resultData.score}%`
    : `Exam submitted. Your score is ${resultData.score}%. The passing score was ${resultData.exam.passingScore}%`;

  // Check if this completion unlocks new content
  let unlockedContent = null;
  if (resultData.isPassed) {
    // Check if this was the last requirement for the chapter
    // This would unlock the next chapter if all requirements are met
    unlockedContent = {
      chapterCompleted: true,
      message: 'This chapter is now complete! New content may be available.',
    };
  }

  sendSuccess(res, 200, message, {
    ...resultData,
    unlockedContent,
  });
});

// Get exam attempt result
export const getStudentExamResult = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated and get userId
  if (!req.user || !req.user.userId) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const { attemptId } = req.params;

  // Validate attemptId
  if (!attemptId) {
    throw new AppError('Attempt ID is required', 400, ErrorTypes.VALIDATION);
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
    logger.warn('Exam result fetch failed - student application not approved', {
      studentId: student.id,
      applicationStatus: student.applicationStatus,
    });

    let errorMessage = 'Your application needs to be approved to access exam results';

    if (student.applicationStatus === ApplicationStatus.REJECTED) {
      errorMessage = 'Your application has been rejected. Please contact support.';
    }

    throw new AppError(errorMessage, 403, ErrorTypes.AUTHORIZATION);
  }

  // Get exam attempt result
  const resultData = await getExamAttemptResult(student.id, attemptId);

  // Create message based on pass/fail status
  const message = resultData.result.isPassed
    ? `You passed this exam with a score of ${resultData.result.score}%`
    : `Your score was ${resultData.result.score}%. The passing score is ${resultData.exam.passingScore}%`;

  sendSuccess(res, 200, message, resultData);
});

export const previewCourse = catchAsync(async (req: Request, res: Response) => {
  // Get the courseId from the route parameters
  const { courseId } = req.params;

  // Validate the courseId format
  if (!courseId || typeof courseId !== 'string') {
    return sendError(res, 400, 'Invalid course ID format');
  }

  try {
    // Call service function to get a single course preview
    const coursePreview = await getPreviewCourse(courseId);

    // Return the course preview data
    sendSuccess(res, 200, 'Course preview retrieved successfully', coursePreview);
  } catch (error) {
    // Handle specific error types that might be thrown from the service
    if ((error as any).statusCode === 404) {
      return sendError(res, 404, 'Course not found');
    }

    // Re-throw other errors to be caught by the global error handler
    throw error;
  }
});

// Get full course content - for enrolled students only
export const getFullCourseContent = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated and get userId
  if (!req.user || !req.user.userId) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const { courseId } = req.params;

  // Validate courseId
  if (!courseId) {
    throw new AppError('Course ID is required', 400, ErrorTypes.VALIDATION);
  }

  // Find the student ID from the user ID
  const student = await prisma.student.findFirst({
    where: { userId: req.user.userId },
  });

  if (!student) {
    logger.warn('Course content fetch failed - student not found', { userId: req.user.userId });
    throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
  }

  // Ensure student's application is approved
  if (student.applicationStatus !== ApplicationStatus.APPROVED) {
    logger.warn('Course content fetch failed - student application not approved', {
      studentId: student.id,
      applicationStatus: student.applicationStatus,
    });

    let errorMessage = 'Your application needs to be approved to access course content';

    if (student.applicationStatus === ApplicationStatus.REJECTED) {
      errorMessage = 'Your application has been rejected. Please contact support.';
    }

    throw new AppError(errorMessage, 403, ErrorTypes.AUTHORIZATION);
  }

  // Call service function
  const courseContent = await getEnrolledCourseContent(student.id, courseId);

  sendSuccess(res, 200, 'Course content retrieved successfully', courseContent);
});

// Request password reset
export const requestPasswordResetController = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400, ErrorTypes.VALIDATION);
  }

  const resetData = await requestPasswordReset(email);

  sendSuccess(res, 200, 'Password reset verification code sent to your email', {
    message: 'Please check your email for the verification code',
    resetId: resetData.resetId,
  });
});

// Complete password reset
export const completePasswordResetController = catchAsync(async (req: Request, res: Response) => {
  const { resetId, verificationCode, newPassword } = req.body;

  if (!resetId || !verificationCode || !newPassword) {
    throw new AppError(
      'Reset ID, verification code, and new password are required',
      400,
      ErrorTypes.VALIDATION,
    );
  }

  // Validate password requirements
  if (newPassword.length < 8) {
    throw new AppError(
      'New password must be at least 8 characters long',
      400,
      ErrorTypes.VALIDATION,
    );
  }

  await completePasswordReset(resetId, verificationCode, newPassword);

  sendSuccess(res, 200, 'Password reset successful', {
    message: 'Your password has been updated successfully',
  });
});

// Refresh access token for students
export const refreshStudentToken = catchAsync(async (req: Request, res: Response) => {
  // Get frontend refresh token
  const { getFrontendTokens, getCookieNames } = await import('../utils/tokenUtils');
  const tokenSelection = getFrontendTokens(req);

  const refreshToken = tokenSelection.refreshToken;

  if (!refreshToken) {
    throw new AppError('Refresh token required', 401, ErrorTypes.AUTHENTICATION);
  }

  const { verifyRefreshToken } = await import('../utils/jwt');
  const { findRefreshToken, revokeRefreshToken, createRefreshToken } = await import(
    '../services/refreshToken.service'
  );

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    throw new AppError('Invalid refresh token', 401, ErrorTypes.AUTHENTICATION);
  }

  // Check if refresh token exists in database and is not revoked
  const refreshTokenRecord = await findRefreshToken(decoded.tokenId);
  if (!refreshTokenRecord) {
    throw new AppError('Refresh token not found or revoked', 401, ErrorTypes.AUTHENTICATION);
  }

  // Get user information
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: { student: true },
  });

  if (!user || user.role !== UserRole.STUDENT || !user.student) {
    throw new AppError('User not found or not a student', 404, ErrorTypes.NOT_FOUND);
  }

  // Check if student's application is approved
  if (user.student.applicationStatus !== ApplicationStatus.APPROVED) {
    throw new AppError('Student application not approved', 403, ErrorTypes.AUTHORIZATION);
  }

  // Generate new access token
  const { generateAccessToken, generateRefreshToken } = await import('../utils/jwt');
  const newAccessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Revoke old refresh token and create new one (token rotation)
  await revokeRefreshToken(decoded.tokenId);
  const newRefreshTokenRecord = await createRefreshToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id, newRefreshTokenRecord.tokenId);

  // Set new cookies using the appropriate cookie names
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieNames = getCookieNames('frontend');
  
  // Determine cookie domain for production
  const cookieDomain = isProduction ? '.wordimpactnetwork.org' : undefined;

  res.cookie(cookieNames.accessToken, newAccessToken, {
    httpOnly: false, // Allow JavaScript access for frontend
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
    domain: cookieDomain,
  });

  res.cookie(cookieNames.refreshToken, newRefreshToken, {
    httpOnly: false, // Allow JavaScript access for frontend
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
    domain: cookieDomain,
  });

  sendSuccess(res, 200, 'Token refreshed successfully', {
    student: {
      id: user.student.id,
      email: user.email,
      fullName: user.student.fullName,
      role: user.role,
      applicationStatus: user.student.applicationStatus,
    },
  });
});
