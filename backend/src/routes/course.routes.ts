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

const router: Router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// POST /api/v1/courses - Create Course (Admin only)
router.post(
  '/',
  authenticate,
  requireAdmin,
  upload.single('coverImage'),
  validateCreateCourse,
  createCourse,
);

// Other course routes
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

export default router;
