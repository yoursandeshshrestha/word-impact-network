import express from 'express';
import {
  createOrder,
  verifyPaymentController,
  getStudentPaymentStatusController,
} from '../controllers/payment.controller';
import { authenticateStudent, requireStudent } from '../middlewares/auth.middleware';
import { authenticateAdmin, requireAdmin } from '../middlewares/auth.middleware';

const router: express.Router = express.Router();

// Student routes
router.post('/create-order', authenticateStudent, requireStudent, createOrder);
router.post('/verify', verifyPaymentController);
router.get('/status', authenticateStudent, requireStudent, getStudentPaymentStatusController);

export default router;
