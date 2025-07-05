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
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Public routes (no authentication required)
router.get('/active', getActiveAnnouncementsController);
router.get('/:id', getAnnouncementByIdController);

// Admin routes (authentication required)
router.use(authenticate);

// Get all announcements (admin only)
router.get('/', getAllAnnouncementsController);

// Create new announcement (admin only)
router.post('/', upload.single('image'), createAnnouncementController);

// Update announcement (admin only)
router.put('/:id', upload.single('image'), updateAnnouncementController);

// Delete announcement (admin only)
router.delete('/:id', deleteAnnouncementController);

// Toggle announcement status (admin only)
router.patch('/:id/toggle-status', toggleAnnouncementStatusController);

export default router;
