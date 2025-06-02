import express from 'express';
import { protect } from '../middlewares/protect';
import { restrictTo } from '../middlewares/restricto';
import {
  getDashboardStatsHandler,
  getRecentResultsHandler,
  getScoreDistributionHandler,
  getCategoryPerformanceHandler,
  getPerformanceDataHandler,
  getAllResultsHandler,
} from '../handlers/student-dashboard-handler';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Dashboard statistics endpoint
router.get(
  '/dashboard/stats/:studentId',
  restrictTo('student', 'admin'),
  getDashboardStatsHandler
);

// Recent results endpoint
router.get(
  '/dashboard/recent-results/:studentId',
  restrictTo('student', 'admin'),
  getRecentResultsHandler
);

// Score distribution endpoint
router.get(
  '/dashboard/score-distribution/:studentId',
  restrictTo('student', 'admin'),
  getScoreDistributionHandler
);

// Category performance endpoint
router.get(
  '/dashboard/category-performance/:studentId',
  restrictTo('student', 'admin'),
  getCategoryPerformanceHandler
);

// Performance data endpoint (for charts)
router.get(
  '/dashboard/performance/:studentId',
  restrictTo('student', 'admin'),
  getPerformanceDataHandler
);

// All results endpoint
router.get(
  '/results/:studentId',
  restrictTo('student', 'admin'),
  getAllResultsHandler
);

export { router as StudentDashboardRouter };
