import express, { Router } from 'express';
import {
  registerAdmin,
  loginAdminController,
  getAdminProfile,
  verifyPasswordReset,
  requestPasswordReset,
  getAllStudentsController,
  getAdminDashboard,
} from '../controllers/admin.controller';
import { validateAdminLogin, validateAdminRegister } from '../validations/admin.validation';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { UserRole } from '@prisma/client';
import { sendBroadcastController } from '@/controllers/broadcast.controller';

const router: Router = express.Router();

router.post('/create-admin', validateAdminRegister, registerAdmin);
router.post('/login-admin', validateAdminLogin, loginAdminController);
router.get('/profile', authenticate, getAdminProfile);

router.post('/request-password-reset', authenticate, requestPasswordReset);
router.post('/verify-password-reset', authenticate, verifyPasswordReset);

router.post('/broadcast', authenticate, authorize([UserRole.ADMIN]), sendBroadcastController);
router.get('/students', authenticate, authorize([UserRole.ADMIN]), getAllStudentsController);

router.get('/dashboard', authenticate, authorize([UserRole.ADMIN]), getAdminDashboard);

export default router;
