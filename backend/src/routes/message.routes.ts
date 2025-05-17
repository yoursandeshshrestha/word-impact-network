import express, { Router } from 'express';
import {
  sendMessageController,
  sendAdminMessageController,
  getUnreadMessagesCountController,
  getConversationsController,
  getConversationMessagesController,
  markConversationAsReadController,
  getStudentAdminConversationController,
} from '../controllers/message.controller';
import {
  validateAdminMessage,
  validateMessage,
  validateMessageFilter,
  validateConversationQuery,
  validatePartnerId,
} from '../validations/message.validation';
import { authenticate } from '../middlewares/auth.middleware';

const router: Router = express.Router();

// All message routes require authentication
router.use(authenticate);

// Basic messaging endpoints
router.post('/', validateMessage, sendMessageController);
router.post('/admin', validateAdminMessage, sendAdminMessageController);
router.get('/unread-count', getUnreadMessagesCountController);

// Conversation endpoints
router.get('/conversations', getConversationsController);
router.get(
  '/conversations/:partnerId',
  validatePartnerId,
  validateConversationQuery,
  getConversationMessagesController,
);
router.put('/conversations/:partnerId/read', validatePartnerId, markConversationAsReadController);

// For students - get conversation with admin (simplified as single conversation)
router.get('/admin-conversation', validateConversationQuery, getStudentAdminConversationController);

export default router;
