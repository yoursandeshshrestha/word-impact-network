import express, { Router } from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import {
  getVimeoAuth,
  handleVimeoCallback,
  createVimeoUploadSession,
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

export default router;
