import express from 'express';
import { protect } from '../middlewares/protect';
import { restrictTo } from '../middlewares/restricto';
import {
  getDashboardStatsHandler,
  getExamResultsHandler,
  getRecentResultsHandler,
} from '../handlers/admin-handler';

const router = express.Router();

router.use(protect, restrictTo('teacher'));

router.get('/dashboard/stats/:teacherId', getDashboardStatsHandler);

router.get('/dashboard/exam-results', getExamResultsHandler);
router.get('/dashboard/exam-results/:examId', getExamResultsHandler);

router.get('/dashboard/recent-results', getRecentResultsHandler);
// ADD THIS MISSING ROUTE:
router.get('/dashboard/recent-results/:examId', getRecentResultsHandler);

export { router as AdminRouter };
