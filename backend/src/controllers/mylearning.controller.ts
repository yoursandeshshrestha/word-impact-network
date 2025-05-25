import { Request, Response } from 'express';
import {
  getMyLearningCourseDetail,
  getMyLearningChapterDetail,
  getStudentEnrolledCoursesForLearning,
  updateVideoProgressHeartbeat,
} from '../services/mylearning.service';
import { sendSuccess } from '../utils/responseHandler';
import { catchAsync } from '../utils/catchAsync';
import { AppError, ErrorTypes } from '@/utils/appError';
import { logger } from '@/utils/logger';
import prisma from '@/config/prisma';

// Get all enrolled courses for My Learning dashboard
export const getMyLearningCourses = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated and get userId
  if (!req.user || !req.user.userId) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  // Find the student ID from the user ID
  const student = await prisma.student.findFirst({
    where: { userId: req.user.userId },
  });

  if (!student) {
    logger.warn('My Learning courses fetch failed - student not found', {
      userId: req.user.userId,
    });
    throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
  }

  // Ensure student's application is approved
  if (student.applicationStatus !== 'APPROVED') {
    logger.warn('My Learning courses fetch failed - student application not approved', {
      studentId: student.id,
      applicationStatus: student.applicationStatus,
    });

    let errorMessage = 'Your application needs to be approved to access your learning dashboard';

    if (student.applicationStatus === 'REJECTED') {
      errorMessage = 'Your application has been rejected. Please contact support.';
    }

    throw new AppError(errorMessage, 403, ErrorTypes.AUTHORIZATION);
  }

  // Get enrolled courses
  const coursesData = await getStudentEnrolledCoursesForLearning(student.id);

  sendSuccess(res, 200, 'My Learning courses retrieved successfully', coursesData);
});

// Get a specific course with progress for the student
export const getMyCourseDetail = catchAsync(async (req: Request, res: Response) => {
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
    logger.warn('Course detail fetch failed - student not found', { userId: req.user.userId });
    throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
  }

  // Ensure student's application is approved
  if (student.applicationStatus !== 'APPROVED') {
    logger.warn('Course detail fetch failed - student application not approved', {
      studentId: student.id,
      applicationStatus: student.applicationStatus,
    });

    let errorMessage = 'Your application needs to be approved to access course content';

    if (student.applicationStatus === 'REJECTED') {
      errorMessage = 'Your application has been rejected. Please contact support.';
    }

    throw new AppError(errorMessage, 403, ErrorTypes.AUTHORIZATION);
  }

  // Get course detail
  const courseDetail = await getMyLearningCourseDetail(student.id, courseId);

  sendSuccess(res, 200, 'Course detail retrieved successfully', courseDetail);
});

// Get chapter details with locking logic
export const getMyChapterDetail = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated and get userId
  if (!req.user || !req.user.userId) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const { courseId, chapterId } = req.params;

  // Validate parameters
  if (!courseId || !chapterId) {
    throw new AppError('Course ID and Chapter ID are required', 400, ErrorTypes.VALIDATION);
  }

  // Find the student ID from the user ID
  const student = await prisma.student.findFirst({
    where: { userId: req.user.userId },
  });

  if (!student) {
    logger.warn('Chapter detail fetch failed - student not found', { userId: req.user.userId });
    throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
  }

  // Ensure student's application is approved
  if (student.applicationStatus !== 'APPROVED') {
    logger.warn('Chapter detail fetch failed - student application not approved', {
      studentId: student.id,
      applicationStatus: student.applicationStatus,
    });

    let errorMessage = 'Your application needs to be approved to access course content';

    if (student.applicationStatus === 'REJECTED') {
      errorMessage = 'Your application has been rejected. Please contact support.';
    }

    throw new AppError(errorMessage, 403, ErrorTypes.AUTHORIZATION);
  }

  // Get chapter detail with locking logic
  const chapterDetail = await getMyLearningChapterDetail(student.id, courseId, chapterId);

  sendSuccess(res, 200, 'Chapter details retrieved successfully', chapterDetail);
});

// Auto-update video progress based on playback heartbeat
export const updateVideoHeartbeat = catchAsync(async (req: Request, res: Response) => {
  // Ensure user is authenticated and get userId
  if (!req.user || !req.user.userId) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const { courseId, chapterId, videoId } = req.params;
  const { currentTime, duration, watchedPercent } = req.body;

  // Validate parameters
  if (!courseId || !chapterId || !videoId) {
    throw new AppError(
      'Course ID, Chapter ID, and Video ID are required',
      400,
      ErrorTypes.VALIDATION,
    );
  }

  // Validate request body
  if (currentTime === undefined || duration === undefined) {
    throw new AppError('Current time and duration are required', 400, ErrorTypes.VALIDATION);
  }

  // Validate numeric values
  if (
    typeof currentTime !== 'number' ||
    typeof duration !== 'number' ||
    currentTime < 0 ||
    duration <= 0 ||
    currentTime > duration
  ) {
    throw new AppError('Invalid time values provided', 400, ErrorTypes.VALIDATION);
  }

  // Calculate watched percent if not provided or validate if provided
  let calculatedWatchedPercent = Math.min(Math.round((currentTime / duration) * 100), 100);

  if (watchedPercent !== undefined && Math.abs(watchedPercent - calculatedWatchedPercent) > 5) {
    // Allow 5% tolerance for rounding differences
    calculatedWatchedPercent = Math.min(Math.max(watchedPercent, 0), 100);
  }

  // Find the student ID from the user ID
  const student = await prisma.student.findFirst({
    where: { userId: req.user.userId },
  });

  if (!student) {
    logger.warn('Video heartbeat failed - student not found', { userId: req.user.userId });
    throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
  }

  // Ensure student's application is approved
  if (student.applicationStatus !== 'APPROVED') {
    logger.warn('Video heartbeat failed - student application not approved', {
      studentId: student.id,
      applicationStatus: student.applicationStatus,
    });

    let errorMessage = 'Your application needs to be approved to access course content';

    if (student.applicationStatus === 'REJECTED') {
      errorMessage = 'Your application has been rejected. Please contact support.';
    }

    throw new AppError(errorMessage, 403, ErrorTypes.AUTHORIZATION);
  }

  // Update video progress and check for unlocks
  const progressResult = await updateVideoProgressHeartbeat(
    student.id,
    courseId,
    chapterId,
    videoId,
    calculatedWatchedPercent,
    currentTime,
  );

  sendSuccess(res, 200, 'Video progress tracked', progressResult);
});
