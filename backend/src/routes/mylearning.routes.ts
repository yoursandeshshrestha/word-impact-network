import express, { Router } from 'express';
import { authenticateStudent } from '../middlewares/auth.middleware';
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
router.get('/courses', authenticateStudent, validateStudent, getMyLearningCourses);

// Get a specific course with progress for the student
router.get('/courses/:courseId', authenticateStudent, validateStudent, getMyCourseDetail);

// Get chapter details with locking logic
router.get(
  '/courses/:courseId/chapters/:chapterId',
  authenticateStudent,
  validateStudent,
  getMyChapterDetail,
);

// Update video heartbeat
router.post(
  '/courses/:courseId/chapters/:chapterId/videos/:videoId/heartbeat',
  authenticateStudent,
  validateStudent,
  updateVideoHeartbeat,
);

router.get(
  '/courses/:courseId/chapters/:chapterId/exams/:examId',
  authenticateStudent,
  validateStudent,
  getMyExamDetail,
);

// Start new exam attempt
router.post(
  '/courses/:courseId/chapters/:chapterId/exams/:examId/start',
  authenticateStudent,
  validateStudent,
  startExamAttempt,
);

// Submit exam attempt
router.post(
  '/courses/:courseId/chapters/:chapterId/exams/:examId/attempts/:attemptId/submit',
  authenticateStudent,
  validateStudent,
  submitExamAttempt,
);

export default router;
