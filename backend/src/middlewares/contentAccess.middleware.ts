// middlewares/contentAccess.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorTypes } from '../utils/appError';
import { canAccessVideo, canAccessExam } from '../utils/progressUtils';
import { logger } from '../utils/logger';
import prisma from '../config/prisma';

// Extend Express Request interface to include student data
declare global {
  namespace Express {
    interface Request {
      student?: {
        id: string;
        userId: string;
      };
    }
  }
}

/**
 * Middleware to validate student exists and is approved
 */
export const validateStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.userId) {
      throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
    }

    // Find the student
    const student = await prisma.student.findFirst({
      where: { userId: req.user.userId },
    });

    if (!student) {
      logger.warn('Student not found for user', { userId: req.user.userId });
      throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if student's application is approved
    if (student.applicationStatus !== 'APPROVED') {
      logger.warn('Access denied - student application not approved', {
        studentId: student.id,
        applicationStatus: student.applicationStatus,
      });

      let errorMessage = 'Your application needs to be approved to access course content';

      if (student.applicationStatus === 'REJECTED') {
        errorMessage = 'Your application has been rejected. Please contact support.';
      }

      throw new AppError(errorMessage, 403, ErrorTypes.AUTHORIZATION);
    }

    // Add student to request object for use in subsequent middleware/controllers
    req.student = {
      id: student.id,
      userId: student.userId,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to validate video access based on progressive unlocking rules
 */
export const validateVideoAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      throw new AppError('Video ID is required', 400, ErrorTypes.VALIDATION);
    }

    if (!req.student) {
      throw new AppError('Student validation required', 500, ErrorTypes.SERVER);
    }

    // Check if student can access this video
    const accessCheck = await canAccessVideo(req.student.id, videoId);

    if (!accessCheck.canAccess) {
      logger.warn('Video access denied', {
        studentId: req.student.id,
        videoId,
        reason: accessCheck.reason,
      });

      throw new AppError(`Access denied: ${accessCheck.reason}`, 403, ErrorTypes.AUTHORIZATION);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to validate exam access based on progressive unlocking rules
 */
export const validateExamAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { examId } = req.params;

    if (!examId) {
      throw new AppError('Exam ID is required', 400, ErrorTypes.VALIDATION);
    }

    if (!req.student) {
      throw new AppError('Student validation required', 500, ErrorTypes.SERVER);
    }

    // Check if student can access this exam
    const accessCheck = await canAccessExam(req.student.id, examId);

    if (!accessCheck.canAccess) {
      logger.warn('Exam access denied', {
        studentId: req.student.id,
        examId,
        reason: accessCheck.reason,
      });

      throw new AppError(`Access denied: ${accessCheck.reason}`, 403, ErrorTypes.AUTHORIZATION);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to validate chapter access based on progressive unlocking rules
 */
export const validateChapterAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chapterId } = req.params;

    if (!chapterId) {
      throw new AppError('Chapter ID is required', 400, ErrorTypes.VALIDATION);
    }

    if (!req.student) {
      throw new AppError('Student validation required', 500, ErrorTypes.SERVER);
    }

    // Get chapter information
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        course: true,
      },
    });

    if (!chapter) {
      throw new AppError('Chapter not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        studentId: req.student.id,
        courseId: chapter.courseId,
        isActive: true,
      },
    });

    if (!enrollment) {
      logger.warn('Chapter access denied - not enrolled', {
        studentId: req.student.id,
        chapterId,
        courseId: chapter.courseId,
      });

      throw new AppError('You are not enrolled in this course', 403, ErrorTypes.AUTHORIZATION);
    }

    // Check if previous chapter is completed (if not first chapter)
    const allChapters = await prisma.chapter.findMany({
      where: { courseId: chapter.courseId },
      orderBy: { orderIndex: 'asc' },
    });

    const currentChapterIndex = allChapters.findIndex((c) => c.id === chapterId);

    if (currentChapterIndex > 0) {
      const previousChapter = allChapters[currentChapterIndex - 1];
      const previousChapterProgress = await prisma.chapterProgress.findUnique({
        where: {
          studentId_chapterId: {
            studentId: req.student.id,
            chapterId: previousChapter.id,
          },
        },
      });

      if (!previousChapterProgress?.isCompleted) {
        logger.warn('Chapter access denied - previous chapter not completed', {
          studentId: req.student.id,
          chapterId,
          previousChapterId: previousChapter.id,
        });

        throw new AppError(
          `Complete the previous chapter "${previousChapter.title}" first`,
          403,
          ErrorTypes.AUTHORIZATION,
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to validate course enrollment
 */
export const validateCourseEnrollment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      throw new AppError('Course ID is required', 400, ErrorTypes.VALIDATION);
    }

    if (!req.student) {
      throw new AppError('Student validation required', 500, ErrorTypes.SERVER);
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        studentId: req.student.id,
        courseId: courseId,
        isActive: true,
      },
    });

    if (!enrollment) {
      logger.warn('Course access denied - not enrolled', {
        studentId: req.student.id,
        courseId,
      });

      throw new AppError('You are not enrolled in this course', 403, ErrorTypes.AUTHORIZATION);
    }

    next();
  } catch (error) {
    next(error);
  }
};
