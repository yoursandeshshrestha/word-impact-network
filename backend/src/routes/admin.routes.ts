import express, { Router } from 'express';
import {
  registerAdmin,
  loginAdminController,
  getAdminProfile,
} from '../controllers/admin.controller';
import { validateAdminLogin, validateAdminRegister } from '../validations/admin.validation';
import { authenticate } from '@/middlewares/auth.middleware';

const router: Router = express.Router();

router.post('/create-admin', validateAdminRegister, registerAdmin);
router.post('/login-admin', validateAdminLogin, loginAdminController);
router.get('/profile', authenticate, getAdminProfile);

export default router;
