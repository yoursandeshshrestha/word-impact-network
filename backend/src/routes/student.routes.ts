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
  previewCourse,
  registerStudent,
  startStudentExamAttempt,
  submitStudentExamAttempt,
  updateStudentProfile,
  updateStudentVideoProgress,
  requestPasswordResetController,
  completePasswordResetController,
} from '../controllers/student.controller';
import {
  validateExamSubmission,
  validateStudentLogin,
  validateStudentProfileUpdate,
  validateStudentRegistration,
  validateVideoProgressUpdate,
} from '../validations/student.validation';
import { authenticate } from '../middlewares/auth.middleware';
import {
  validateStudent,
  validateVideoAccess,
  validateExamAccess,
  validateChapterAccess,
  validateCourseEnrollment,
} from '../middlewares/contentAccess.middleware';

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

// Student profile routes
router.get('/profile', authenticate, validateStudent, getStudentProfile);
router.put(
  '/profile',
  authenticate,
  validateStudent,
  validateStudentProfileUpdate,
  updateStudentProfile,
);

// Course routes
router.get('/courses', authenticate, validateStudent, getCourses);
router.post('/courses/:courseId/enroll', authenticate, validateStudent, enrollInCourse);

// Progress routes
router.get('/progress', authenticate, validateStudent, getStudentProgress);

// Chapter progress route with access validation
router.get(
  '/chapters/:chapterId/progress',
  authenticate,
  validateStudent,
  validateChapterAccess,
  getStudentChapterProgress,
);

// Video progress route with access validation
router.post(
  '/videos/:videoId/progress',
  authenticate,
  validateStudent,
  validateVideoAccess,
  validateVideoProgressUpdate,
  updateStudentVideoProgress,
);

// Exam routes with progressive access validation
router.get(
  '/exams/:examId',
  authenticate,
  validateStudent,
  validateExamAccess,
  getStudentExamDetails,
);

router.post(
  '/exams/:examId/attempt',
  authenticate,
  validateStudent,
  validateExamAccess,
  startStudentExamAttempt,
);

router.post(
  '/exam-attempts/:attemptId/submit',
  authenticate,
  validateStudent,
  validateExamSubmission,
  submitStudentExamAttempt,
);

router.get('/exam-attempts/:attemptId/result', authenticate, validateStudent, getStudentExamResult);

// Preview courses - public access (no authentication required)
router.get('/courses/:courseId/preview', previewCourse);

// Authorized route for enrolled students to access full course content with progressive unlocking
router.get(
  '/courses/:courseId/content',
  authenticate,
  validateStudent,
  validateCourseEnrollment,
  getFullCourseContent,
);

// Additional routes for checking access status (useful for frontend)
router.get('/videos/:videoId/access-status', authenticate, validateStudent, async (req, res) => {
  const { videoId } = req.params;
  const { canAccessVideo } = await import('../utils/progressUtils');

  const accessCheck = await canAccessVideo(req.student!.id, videoId);

  res.json({
    success: true,
    data: {
      videoId,
      canAccess: accessCheck.canAccess,
      reason: accessCheck.reason || null,
    },
  });
});

router.get('/exams/:examId/access-status', authenticate, validateStudent, async (req, res) => {
  const { examId } = req.params;
  const { canAccessExam } = await import('../utils/progressUtils');

  const accessCheck = await canAccessExam(req.student!.id, examId);

  res.json({
    success: true,
    data: {
      examId,
      canAccess: accessCheck.canAccess,
      reason: accessCheck.reason || null,
    },
  });
});

// Route to get unlocked content summary for a course
router.get(
  '/courses/:courseId/unlocked-content',
  authenticate,
  validateStudent,
  validateCourseEnrollment,
  async (req, res) => {
    const { courseId } = req.params;
    const { getEnrolledCourseContent } = await import('../services/student.service');

    const courseContent = await getEnrolledCourseContent(req.student!.id, courseId);

    // Extract just the unlocking information
    const unlockedSummary = {
      courseId,
      totalChapters: courseContent.chapters.length,
      unlockedChapters: courseContent.chapters.filter((c) => c.isUnlocked).length,
      totalVideos: courseContent.chapters.reduce((sum, c) => sum + c.videos.length, 0),
      unlockedVideos: courseContent.chapters.reduce(
        (sum, c) => sum + c.videos.filter((v) => v.isUnlocked).length,
        0,
      ),
      totalExams: courseContent.chapters.filter((c) => c.exam).length,
      unlockedExams: courseContent.chapters.filter((c) => c.exam?.isUnlocked).length,
      nextAction: courseContent.nextAction,
      progress: courseContent.progress,
    };

    res.json({
      success: true,
      message: 'Unlocked content summary retrieved successfully',
      data: unlockedSummary,
    });
  },
);

// Password reset routes
router.post('/request-password-reset', requestPasswordResetController);
router.post('/complete-password-reset', completePasswordResetController);

export default router;
