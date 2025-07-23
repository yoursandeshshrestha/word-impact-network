import express from 'express';
import {
  getPayment,
  getAllPaymentsController,
  getPaymentStats,
} from '../controllers/payment.controller';
import { authenticateAdmin, requireAdmin } from '../middlewares/auth.middleware';

const router: express.Router = express.Router();

// Admin routes
router.get('/payments', authenticateAdmin, requireAdmin, getAllPaymentsController);
router.get('/payments/:paymentId', authenticateAdmin, requireAdmin, getPayment);
router.get('/stats', authenticateAdmin, requireAdmin, getPaymentStats);

export default router;
