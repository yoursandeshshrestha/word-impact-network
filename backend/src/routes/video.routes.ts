import express, { Router } from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { validateUpdateVideo } from '../validations/video.validation';
import multer from 'multer';
import { getVideoById, updateVideo, deleteVideo, getVideoStatus, getVideosWithStatus } from '../controllers/video.controller';

const router: Router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // 5GB limit for videos
});

/**
 * Video routes
 */

// GET /api/v1/videos/:id - Get Video by ID
router.get('/:id', getVideoById);

// GET /api/v1/videos/:id/status - Get Video Processing Status
router.get('/:id/status', getVideoStatus);

// GET /api/v1/videos/chapter/:chapterId/status - Get All Videos with Status for Chapter
router.get('/chapter/:chapterId/status', getVideosWithStatus);

// PUT /api/v1/videos/:id - Update Video (Admin only)
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  upload.single('video'),
  validateUpdateVideo,
  updateVideo,
);

// DELETE /api/v1/videos/:id - Delete Video (Admin only)
router.delete('/:id', authenticate, requireAdmin, deleteVideo);

export default router;
