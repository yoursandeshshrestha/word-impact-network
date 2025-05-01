import express, { Router } from 'express';
import {
  createExam,
  getExamById,
  updateExam,
  deleteExam,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from '@/controllers/exam.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validateExam, validateQuestion } from '@/validations/exam.validation';

const router: Router = express.Router();

// Exam routes
router.post('/chapters/:chapterId', authenticate, validateExam, createExam);
router.get('/:id', authenticate, getExamById);
router.put('/:id', authenticate, validateExam, updateExam);
router.delete('/:id', authenticate, deleteExam);

// Question routes
router.post('/:examId/questions', authenticate, validateQuestion, addQuestion);
router.put('/:examId/questions/:id', authenticate, validateQuestion, updateQuestion);
router.delete('/:examId/questions/:id', authenticate, deleteQuestion);

export default router;
