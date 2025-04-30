import express, { Router } from 'express';
import adminRoutes from './admin.routes';
import studentRoutes from './student.routes';
import applicationRoutes from './application.routes';
import courseRoutes from './course.routes';
import chapterRoutes from './chapter.routes';
const router: Router = express.Router();

// admin routes
router.use('/admin', adminRoutes);

// student routes
router.use('/student', studentRoutes);

// application routes
router.use('/applications', applicationRoutes);

// course routes
router.use('/courses', courseRoutes);   

// chapter routes
router.use('/chapters', chapterRoutes);

export default router;
