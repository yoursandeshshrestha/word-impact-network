import { Router } from 'express';
import authRoutes from './auth.routes';
import adminApplicationRoutes from './admin/application.routes';
import adminRoutes from './admin/admin.routes';

const router: Router = Router();

// API prefix from environment variables
const apiPrefix = process.env.API_PREFIX || '/api/v1';

// Auth routes
router.use(`${apiPrefix}/auth`, authRoutes);

// Admin routes
router.use(`${apiPrefix}/admin/applications`, adminApplicationRoutes);
router.use(`${apiPrefix}/admin`, adminRoutes);

export default router;
