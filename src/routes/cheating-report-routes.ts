import express from 'express';
import { protect } from '../middlewares/protect';
import { restrictTo } from '../middlewares/restricto';
import {
  createCheatingReportHandler,
  getAllCheatingReportsHandler,
} from '../handlers/cheating-report-handler';

const router = express.Router();

// Route to receive cheating reports (accessible to authenticated users)
router.post('/', protect, createCheatingReportHandler);

// Route to get all cheating reports (admin and teacher only)
router.get('/', protect, restrictTo('admin', 'teacher'), getAllCheatingReportsHandler);

export { router as CheatingReportRouter }; 