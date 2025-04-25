import express, { Router } from 'express';
import { registerAdmin, loginAdminController } from '../controllers/admin.controller';
import { validateAdminLogin, validateAdminRegister } from '../validations/admin.validation';

const router: Router = express.Router();

router.post('/create-admin', validateAdminRegister, registerAdmin);
router.post('/login-admin', validateAdminLogin, loginAdminController);

export default router;
