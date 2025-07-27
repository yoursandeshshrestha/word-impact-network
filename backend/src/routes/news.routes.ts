import express, { Router } from 'express';
import multer from 'multer';
import {
  getActiveNewsController,
  getAllNewsController,
  getNewsByIdController,
  getNewsBySlugController,
  createNewsController,
  updateNewsController,
  deleteNewsController,
  toggleNewsStatusController,
} from '../controllers/news.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateCreateNews, validateUpdateNews } from '../validations/news.validation';

const router: Router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for different types
const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const videoFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed'));
  }
};

// Configure multer for multiple file uploads
const uploadMultiple = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, // 5GB limit for videos
    files: 8, // Maximum 8 files total
  },
}).fields([
  { name: 'images', maxCount: 5 }, // Max 5 images
  { name: 'videos', maxCount: 3 }, // Max 3 videos
]);

// Public routes (no authentication required)
router.get('/active', getActiveNewsController);
router.get('/slug/:slug', getNewsBySlugController);
router.get('/:id', getNewsByIdController);

// Admin routes (authentication required)
router.use(authenticate);

// Get all news (admin only)
router.get('/', getAllNewsController);

// Create new news (admin only)
router.post('/', uploadMultiple, validateCreateNews, createNewsController);

// Update news (admin only)
router.put('/:id', uploadMultiple, validateUpdateNews, updateNewsController);

// Delete news (admin only)
router.delete('/:id', deleteNewsController);

// Toggle news status (admin only)
router.patch('/:id/toggle-status', toggleNewsStatusController);

export default router;
