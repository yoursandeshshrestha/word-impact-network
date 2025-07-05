import express, { Router } from 'express';
import adminRoutes from './admin.routes';
import studentRoutes from './student.routes';
import applicationRoutes from './application.routes';
import courseRoutes from './course.routes';
import chapterRoutes from './chapter.routes';
import videoRoutes from './video.routes';
import examRoutes from './exam.routes';
import messageRoutes from './message.routes';
import notificationRoutes from './notification.routes';
import analyticsRoutes from './analytics.routes';
import myLearningRoutes from './mylearning.routes';
import announcementRoutes from './announcement.routes';

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

// my learning routes
router.use('/mylearning', myLearningRoutes);

// announcement routes
router.use('/announcements', announcementRoutes);

export default router;
