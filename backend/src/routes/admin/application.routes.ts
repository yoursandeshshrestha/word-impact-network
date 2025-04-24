import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';
import {
  getAllApplicationsController,
  getApplicationController,
  updateApplicationStatusController,
  deleteApplicationController,
} from '../../controllers/admin/application.controller';

const router: Router = Router();

// Application routes with authentication and admin role required
router.get('/', authenticate as any, requireAdmin as any, getAllApplicationsController);
router.get('/:id', authenticate as any, requireAdmin as any, getApplicationController);
router.patch(
  '/:id/status',
  authenticate as any,
  requireAdmin as any,
  updateApplicationStatusController,
);
router.delete('/:id', authenticate as any, requireAdmin as any, deleteApplicationController);

export default router;
