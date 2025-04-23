import { Router, RequestHandler } from 'express';
import { applyController, loginController, getMeController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router: Router = Router();

// Public routes
router.post('/apply', applyController);
router.post('/login', loginController);

// Protected routes
router.get('/me', authenticate as any, getMeController);

export default router;
