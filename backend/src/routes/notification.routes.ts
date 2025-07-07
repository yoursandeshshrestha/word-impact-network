import express, { Router } from 'express';
import {
  getNotificationsController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
} from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';
import {
  validateNotificationQuery,
  validateNotificationId,
} from '../validations/notification.validation';

const router: Router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all notifications for the authenticated user
router.get('/', validateNotificationQuery, getNotificationsController);

// Mark a single notification as read
router.put('/:id/read', validateNotificationId, markNotificationAsReadController);

// Mark all notifications as read
router.put('/read-all', markAllNotificationsAsReadController);

export default router;
