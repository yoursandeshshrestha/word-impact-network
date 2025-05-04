import express, { Router } from 'express';
import {
  sendMessageController,
  getMessagesController,
  markMessageAsReadController,
} from '../controllers/message.controller';
import { validateMessage, validateMessageFilter } from '../validations/message.validation';
import { authenticate } from '../middlewares/auth.middleware';

const router: Router = express.Router();

// All message routes require authentication
router.use(authenticate);

// Send a message to the admin
router.post('/', validateMessage, sendMessageController);

// Get messages (with optional filtering)
router.get('/', validateMessageFilter, getMessagesController);

// Mark a message as read
router.put('/:id/read', markMessageAsReadController);

export default router;
