import express, { Router } from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { validateUpdateChapter } from '../validations/chapter.validation';
import { getChapterById, updateChapter, deleteChapter } from '@/controllers/chapter.controller';

const router: Router = express.Router();

router.get('/:id', getChapterById);

router.put('/:id', authenticate, requireAdmin, validateUpdateChapter, updateChapter);

router.delete('/:id', authenticate, requireAdmin, deleteChapter);

export default router;
