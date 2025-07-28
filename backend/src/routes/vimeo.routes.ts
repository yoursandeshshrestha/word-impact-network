import express, { Router } from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import {
  getVimeoAuth,
  handleVimeoCallback,
  createVimeoUploadSession,
  updateVideoPrivacy,
  checkVideoPrivacy,
} from '../controllers/vimeo.controller';

const router: Router = express.Router();

/**
 * Vimeo OAuth routes
 */

// GET /api/v1/vimeo/auth - Get Vimeo authorization URL
router.get('/auth', authenticate, requireAdmin, getVimeoAuth);

// GET /api/v1/vimeo/callback - Handle Vimeo OAuth callback
router.get('/callback', handleVimeoCallback);

// POST /api/v1/vimeo/create-upload - Create Vimeo TUS upload session
router.post('/create-upload', authenticate, requireAdmin, createVimeoUploadSession);

// PATCH /api/v1/vimeo/videos/:videoId/privacy - Update video privacy settings
router.patch('/videos/:videoId/privacy', authenticate, requireAdmin, updateVideoPrivacy);

// GET /api/v1/vimeo/videos/:videoId/privacy - Check video privacy settings
router.get('/videos/:videoId/privacy', authenticate, requireAdmin, checkVideoPrivacy);

export default router;
