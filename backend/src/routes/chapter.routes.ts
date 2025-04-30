import express, { Router } from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { validateUpdateChapter } from '../validations/chapter.validation';
import { getChapterById, updateChapter, deleteChapter } from '@/controllers/chapter.controller';
import { addVideoToChapter, getVideosByChapterId } from '@/controllers/video.controller';
import { validateCreateVideo } from '@/validations/video.validation';
import { upload } from '../utils/upload';

const router: Router = express.Router();

router.get('/:id', getChapterById);

router.put('/:id', authenticate, requireAdmin, validateUpdateChapter, updateChapter);

router.delete('/:id', authenticate, requireAdmin, deleteChapter);

router.post(
  '/:chapterId/videos',
  authenticate,
  requireAdmin,
  upload.single('video'),
  validateCreateVideo,
  addVideoToChapter,
);

// POST /api/v1/chapters/:chapterId/video - Add Video to Chapter (Admin only) - Singular form
router.post(
  '/:chapterId/video',
  authenticate,
  requireAdmin,
  upload.single('video'),
  validateCreateVideo,
  addVideoToChapter,
);

// GET /api/v1/chapters/:chapterId/videos - Get All Videos for Chapter
router.get('/:chapterId/videos', getVideosByChapterId);

// GET /api/v1/chapters/:chapterId/video - Get All Videos for Chapter - Singular form
router.get('/:chapterId/video', getVideosByChapterId);

export default router;
