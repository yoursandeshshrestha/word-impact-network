import express, { Router } from 'express';
import {
  getNotificationsController,
  markAllNotificationsAsReadController,
} from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateNotificationQuery } from '../validations/notification.validation';

const router: Router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all notifications for the authenticated user
router.get('/', validateNotificationQuery, getNotificationsController);

// Mark all notifications as read
router.put('/read-all', markAllNotificationsAsReadController);

export default router;
