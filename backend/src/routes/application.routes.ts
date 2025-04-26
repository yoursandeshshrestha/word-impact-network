import express, { Router } from 'express';
import {
  getAllApplicationsController,
  getApplicationByIdController,
  updateApplicationStatusController,
  deleteApplicationController,
} from '../controllers/application.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { validateApplicationStatusUpdate } from '../validations/application.validation';

const router: Router = express.Router();

// All application routes require admin authentication
router.use(authenticate, requireAdmin);

// Application management routes
router.get('/', getAllApplicationsController);
router.get('/:id', getApplicationByIdController);
router.patch(
  '/update-status/:id',
  validateApplicationStatusUpdate,
  updateApplicationStatusController,
);
router.delete('/:id', deleteApplicationController);

export default router;
