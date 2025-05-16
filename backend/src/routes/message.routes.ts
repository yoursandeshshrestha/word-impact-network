import express, { Router } from 'express';
import {
  sendMessageController,
  getMessagesController,
  markMessageAsReadController,
  sendAdminMessageController,
  getUnreadMessagesCountController,
} from '../controllers/message.controller';
import {
  validateAdminMessage,
  validateMessage,
  validateMessageFilter,
} from '../validations/message.validation';
import { authenticate } from '../middlewares/auth.middleware';

const router: Router = express.Router();

// All message routes require authentication
router.use(authenticate);

// Send a message to the admin (for students)
router.post('/', validateMessage, sendMessageController);

// Send a message to a student (for admin)
router.post('/admin', validateAdminMessage, sendAdminMessageController);

// Get messages (with optional filtering)
router.get('/', validateMessageFilter, getMessagesController);

// Mark a message as read
router.put('/:id/read', markMessageAsReadController);

// Get unread messages count
router.get('/unread-count', getUnreadMessagesCountController);

export default router;
