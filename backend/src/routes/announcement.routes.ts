import express, { Router } from 'express';
import multer from 'multer';
import {
  getActiveAnnouncementsController,
  getAllAnnouncementsController,
  getAnnouncementByIdController,
  createAnnouncementController,
  updateAnnouncementController,
  deleteAnnouncementController,
  toggleAnnouncementStatusController,
} from '../controllers/announcement.controller';
import { authenticate } from '../middlewares/auth.middleware';

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

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow common document types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only document files are allowed'));
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
    files: 10 // Maximum 10 files total
  },
}).fields([
  { name: 'images', maxCount: 5 }, // Max 5 images
  { name: 'files', maxCount: 5 },  // Max 5 files
  { name: 'videos', maxCount: 3 }, // Max 3 videos
]);

// Public routes (no authentication required)
router.get('/active', getActiveAnnouncementsController);
router.get('/:id', getAnnouncementByIdController);

// Admin routes (authentication required)
router.use(authenticate);

// Get all announcements (admin only)
router.get('/', getAllAnnouncementsController);

// Create new announcement (admin only)
router.post('/', uploadMultiple, createAnnouncementController);

// Update announcement (admin only)
router.put('/:id', uploadMultiple, updateAnnouncementController);

// Delete announcement (admin only)
router.delete('/:id', deleteAnnouncementController);

// Toggle announcement status (admin only)
router.patch('/:id/toggle-status', toggleAnnouncementStatusController);

export default router;
