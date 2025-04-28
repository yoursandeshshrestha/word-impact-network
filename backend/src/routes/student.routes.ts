import express, { Router } from 'express';
import multer from 'multer';
import { loginStudentController, registerStudent } from '../controllers/student.controller';
import {
  validateStudentLogin,
  validateStudentRegistration,
} from '../validations/student.validation';
import { authenticate } from '../middlewares/auth.middleware';
import { getStudentProfile } from '../controllers/student.controller';

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

export default router;
