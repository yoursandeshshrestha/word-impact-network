import express, { Router } from 'express';
import adminRoutes from './admin.routes';

const router: Router = express.Router();

router.use('/admin', adminRoutes);

export default router;
