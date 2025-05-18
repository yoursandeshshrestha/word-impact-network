import express, { Router } from 'express';
import multer from 'multer';
import {
  enrollInCourse,
  getCourses,
  getFullCourseContent,
  getStudentChapterProgress,
  getStudentExamDetails,
  getStudentExamResult,
  getStudentProfile,
  getStudentProgress,
  loginStudentController,
  previewCourses,
  registerStudent,
  startStudentExamAttempt,
  submitStudentExamAttempt,
  updateStudentProfile,
  updateStudentVideoProgress,
} from '../controllers/student.controller';
import {
  validateExamSubmission,
  validateStudentLogin,
  validateStudentProfileUpdate,
  validateStudentRegistration,
  validateVideoProgressUpdate,
} from '../validations/student.validation';
import { authenticate } from '../middlewares/auth.middleware';

const router: Router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Student registration route with file uploads
router.post(
  '/register',
  upload.fields([
    { name: 'certificate', maxCount: 1 },
    { name: 'recommendationLetter', maxCount: 1 },
  ]),
  validateStudentRegistration,
  registerStudent,
);

// Student login route
router.post('/login', validateStudentLogin, loginStudentController);

// Student profile route
router.get('/profile', authenticate, getStudentProfile);

// Student profile route
router.put('/profile', authenticate, validateStudentProfileUpdate, updateStudentProfile);

// course routes
router.get('/courses', authenticate, getCourses);
router.post('/courses/:courseId/enroll', authenticate, enrollInCourse);

// Progress route
router.get('/progress', authenticate, getStudentProgress);
router.get('/chapters/:chapterId/progress', authenticate, getStudentChapterProgress);
router.post(
  '/videos/:videoId/progress',
  authenticate,
  validateVideoProgressUpdate,
  updateStudentVideoProgress,
);

// Exam routes
router.get('/exams/:examId', authenticate, getStudentExamDetails);
router.post('/exams/:examId/attempt', authenticate, startStudentExamAttempt);
router.post(
  '/exam-attempts/:attemptId/submit',
  authenticate,
  validateExamSubmission,
  submitStudentExamAttempt,
);
router.get('/exam-attempts/:attemptId/result', authenticate, getStudentExamResult);

// Preview courses - public access
router.get('/courses/preview', previewCourses);

// Authorized route for enrolled students to access full course content
router.get('/courses/:courseId/content', authenticate, getFullCourseContent);

export default router;
