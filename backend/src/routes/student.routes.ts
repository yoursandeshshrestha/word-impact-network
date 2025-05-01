import express, { Router } from 'express';
import multer from 'multer';
import {
  getCourses,
  getStudentProfile,
  loginStudentController,
  registerStudent,
  updateStudentProfile,
} from '../controllers/student.controller';
import {
  validateStudentLogin,
  validateStudentProfileUpdate,
  validateStudentRegistration,
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

export default router;
