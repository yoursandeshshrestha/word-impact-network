import express, { Router } from 'express';
import adminRoutes from '@/routes/admin.routes';
import studentRoutes from '@/routes/student.routes';
import applicationRoutes from '@/routes/application.routes';
import courseRoutes from '@/routes/course.routes';
import chapterRoutes from '@/routes/chapter.routes';
import videoRoutes from '@/routes/video.routes';
import examRoutes from '@/routes/exam.routes';
import messageRoutes from '@/routes/message.routes';
import notificationRoutes from '@/routes/notification.routes';
import analyticsRoutes from '@/routes/analytics.routes';

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

// video routes
router.use('/videos', videoRoutes);

// exam routes
router.use('/exams', examRoutes);

// message routes
router.use('/messages', messageRoutes);

// notification routes
router.use('/notifications', notificationRoutes);

// analytics routes
router.use('/analytics', analyticsRoutes);

export default router;
