import express, { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validateStudent } from '../middlewares/contentAccess.middleware';
import {
  getMyChapterDetail,
  getMyCourseDetail,
  getMyLearningCourses,
  getMyExamDetail,
  updateVideoHeartbeat,
  submitExamAttempt,
  startExamAttempt,
} from '@/controllers/mylearning.controller';

const router: Router = express.Router();

// Get all enrolled courses with progress for the student
router.get('/courses', authenticate, validateStudent, getMyLearningCourses);

// Get a specific course with progress for the student
router.get('/courses/:courseId', authenticate, validateStudent, getMyCourseDetail);

// Get chapter details with locking logic
router.get(
  '/courses/:courseId/chapters/:chapterId',
  authenticate,
  validateStudent,
  getMyChapterDetail,
);

// Update video heartbeat
router.post(
  '/courses/:courseId/chapters/:chapterId/videos/:videoId/heartbeat',
  authenticate,
  validateStudent,
  updateVideoHeartbeat,
);

router.get(
  '/courses/:courseId/chapters/:chapterId/exams/:examId',
  authenticate,
  validateStudent,
  getMyExamDetail,
);

// Start new exam attempt
router.post(
  '/courses/:courseId/chapters/:chapterId/exams/:examId/start',
  authenticate,
  validateStudent,
  startExamAttempt,
);

// Submit exam attempt
router.post(
  '/courses/:courseId/chapters/:chapterId/exams/:examId/attempts/:attemptId/submit',
  authenticate,
  validateStudent,
  submitExamAttempt,
);

export default router;
