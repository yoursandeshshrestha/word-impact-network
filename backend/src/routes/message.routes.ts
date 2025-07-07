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
  validateConversationQuery,
  validatePartnerId,
} from '../validations/message.validation';
import {
  authenticate,
  authenticateAdmin,
  authenticateStudent,
} from '../middlewares/auth.middleware';

const router: Router = express.Router();

// All message routes require authentication (supports both admin and student)
// router.use(authenticate);

// Basic messaging endpoints
router.post('/', validateMessage, authenticateStudent, sendMessageController);
router.post('/admin', validateAdminMessage, authenticateAdmin, sendAdminMessageController);
router.get('/unread-count', authenticate, getUnreadMessagesCountController);

// Conversation endpoints
router.get('/conversations', authenticateAdmin, getConversationsController);
router.get(
  '/conversations/:partnerId',
  validatePartnerId,
  validateConversationQuery,
  authenticateAdmin,
  getConversationMessagesController,
);
router.put(
  '/conversations/:partnerId/read',
  validatePartnerId,
  authenticateAdmin,
  markConversationAsReadController,
);

// For students - get conversation with admin (simplified as single conversation)
router.get(
  '/admin-conversation',
  validateConversationQuery,
  authenticateStudent,
  getStudentAdminConversationController,
);

export default router;
