import express, { Router } from 'express';
import {
  registerAdmin,
  loginAdminController,
  getAdminProfile,
  verifyPasswordReset,
  requestPasswordReset,
  getAllStudentsController,
  getAdminDashboard,
  logoutAdmin,
  refreshAccessToken,
} from '../controllers/admin.controller';
import { validateAdminLogin, validateAdminRegister } from '../validations/admin.validation';
import { authenticateAdmin, authorize } from '@/middlewares/auth.middleware';
import { UserRole } from '@prisma/client';
import { sendBroadcastController } from '@/controllers/broadcast.controller';

const router: Router = express.Router();

router.post('/create-admin', validateAdminRegister, registerAdmin);
router.post('/login-admin', validateAdminLogin, loginAdminController);
  router.post('/logout', authenticateAdmin, logoutAdmin);
router.post('/refresh-token', refreshAccessToken);
router.get('/profile', authenticateAdmin, getAdminProfile);

router.post('/request-password-reset', authenticateAdmin, requestPasswordReset);
router.post('/verify-password-reset', authenticateAdmin, verifyPasswordReset);

router.post('/broadcast', authenticateAdmin, authorize([UserRole.ADMIN]), sendBroadcastController);
router.get('/students', authenticateAdmin, authorize([UserRole.ADMIN]), getAllStudentsController);

router.get('/dashboard', authenticateAdmin, authorize([UserRole.ADMIN]), getAdminDashboard);

export default router;
