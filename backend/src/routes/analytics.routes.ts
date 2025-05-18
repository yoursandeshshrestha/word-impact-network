import express, { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';
import {
  getAnalyticsDashboard,
  getEnrollmentTrendsController,
  getCourseCompletionRatesController,
  getVideoEngagementController,
  getExamPerformanceController,
  getStudentProgressController,
  getGeographicDistributionController,
  getReferralStatsController,
} from '../controllers/analytics.controller';
import {
  validateAnalyticsPeriod,
  validateAnalyticsPagination,
  validateAnalyticsDateRange,
} from '../validations/analytics.validation';

const router: Router = express.Router();

// All analytics routes require authentication and admin role
const authMiddleware = [authenticate, authorize([UserRole.ADMIN])];

// Comprehensive analytics dashboard (all metrics in one call)
router.get('/dashboard', authMiddleware, getAnalyticsDashboard);

// Individual analytics endpoints for more specific/filtered data
router.get(
  '/enrollment-trends',
  authMiddleware,
  validateAnalyticsPeriod,
  getEnrollmentTrendsController,
);

router.get('/course-completion', authMiddleware, getCourseCompletionRatesController);

router.get(
  '/video-engagement',
  authMiddleware,
  validateAnalyticsPagination,
  getVideoEngagementController,
);

router.get('/exam-performance', authMiddleware, getExamPerformanceController);

router.get(
  '/student-progress',
  authMiddleware,
  validateAnalyticsPagination,
  getStudentProgressController,
);

router.get('/geographic-distribution', authMiddleware, getGeographicDistributionController);

router.get('/referral-stats', authMiddleware, getReferralStatsController);

export default router;
