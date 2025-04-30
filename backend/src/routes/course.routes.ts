import express, { Router } from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { validateCreateCourse, validateUpdateCourse } from '../validations/course.validation';
import multer from 'multer';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from '../controllers/course.controller';
import { validateCreateChapter } from '@/validations/chapter.validation';
import { createChapterController, getChaptersByCourseId } from '@/controllers/chapter.controller';

const router: Router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post(
  '/',
  authenticate,
  requireAdmin,
  upload.single('coverImage'),
  validateCreateCourse,
  createCourse,
);
router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  upload.single('coverImage'),
  validateUpdateCourse,
  updateCourse,
);
router.delete('/:id', authenticate, requireAdmin, deleteCourse);

// chapter routes
router.post(
  '/:courseId/chapters',
  authenticate,
  requireAdmin,
  validateCreateChapter,
  createChapterController,
);

// GET /api/v1/courses/:courseId/chapters - Get All Chapters for Course
router.get('/:courseId/chapters', getChaptersByCourseId);

export default router;
