import express from 'express';
import { protect } from '../middlewares/protect';
import {
  createNewExamHandler,
  getAllExamsHandler,
} from '../handlers/exam-handler';
import { restrictTo } from '../middlewares/restricto';
import { createExamValidations } from '../utils/createExamValidation';
import { validateRequest } from '../middlewares/validateRequest';

const router = express.Router();

router
  .route('/')
  .get(protect, getAllExamsHandler)
  .post(
    protect,
    restrictTo('teacher', 'admin'),
    createExamValidations,
    validateRequest,
    createNewExamHandler
  );

export { router as ExamRouter };
