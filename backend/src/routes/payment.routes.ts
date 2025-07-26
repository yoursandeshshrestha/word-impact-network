import express from 'express';
import {
  createOrder,
  verifyPaymentController,
  getStudentPaymentStatusController,
  createApplicationOrder,
  verifyApplicationPaymentController,
} from '../controllers/payment.controller';
import { authenticateStudent, requireStudent } from '../middlewares/auth.middleware';
import { authenticateAdmin, requireAdmin } from '../middlewares/auth.middleware';

const router: express.Router = express.Router();

// Student routes (require authentication)
router.post('/create-order', authenticateStudent, requireStudent, createOrder);
router.post('/verify', verifyPaymentController);
router.get('/status', authenticateStudent, requireStudent, getStudentPaymentStatusController);

// Application payment routes (no authentication required)
router.post('/application/create-order', createApplicationOrder);
router.post('/application/verify', verifyApplicationPaymentController);

export default router;
