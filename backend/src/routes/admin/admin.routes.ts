import { createAdminController } from '@/controllers/admin.controller';
import { Router } from 'express';

const router: Router = Router();

// Route for creating an admin user
router.post('/create', createAdminController);

export default router;
