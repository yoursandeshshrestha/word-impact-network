import express, { Router } from 'express';
import adminRoutes from './admin.routes';
import studentRoutes from './student.routes';
import applicationRoutes from './application.routes';
const router: Router = express.Router();

// admin routes
router.use('/admin', adminRoutes);

// student routes
router.use('/student', studentRoutes);

// application routes
router.use('/applications', applicationRoutes);

export default router;
