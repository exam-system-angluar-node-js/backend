import express from 'express';
import { protect } from '../middlewares/protect';
import {
  createNewExamHandler,
  getAllExamsHandler,
  submitExam,
  takeExamHandler,
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

router.get('/:examId', protect, restrictTo('student'), takeExamHandler);
router.post('/submit/:resultId', protect, restrictTo('student'), submitExam);

export { router as ExamRouter };
