import express, { Router } from 'express';
import {
  registerAdmin,
  loginAdminController,
  getAdminProfile,
  verifyPasswordReset,
  requestPasswordReset,
} from '../controllers/admin.controller';
import { validateAdminLogin, validateAdminRegister } from '../validations/admin.validation';
import { authenticate } from '@/middlewares/auth.middleware';

const router: Router = express.Router();

router.post('/create-admin', validateAdminRegister, registerAdmin);
router.post('/login-admin', validateAdminLogin, loginAdminController);
router.get('/profile', authenticate, getAdminProfile);

router.post('/request-password-reset', authenticate, requestPasswordReset);
router.post('/verify-password-reset', authenticate, verifyPasswordReset);

export default router;
