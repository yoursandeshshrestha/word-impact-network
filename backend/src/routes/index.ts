import express, { Router } from 'express';
import adminRoutes from './admin.routes';
import studentRoutes from './student.routes';

const router: Router = express.Router();

router.use('/admin', adminRoutes);

// student routes
router.use('/student', studentRoutes);

export default router;
