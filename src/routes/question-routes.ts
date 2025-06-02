import express from 'express';
import { protect } from '../middlewares/protect';
import { restrictTo } from '../middlewares/restricto';
import {
  addQuestionToExam,
  getExamQuestions,
} from '../handlers/question-handler';
import { createQuestionValidation } from '../utils/create-question-validation';
import { validateRequest } from '../middlewares/validateRequest';

const router = express.Router();

router
  .route('/:examId')
  .get(protect, getExamQuestions) // Allow all authenticated users (students, teachers, admins)
  .post(
    protect,
    restrictTo('teacher', 'admin'), // Only teachers/admins can add questions
    createQuestionValidation,
    validateRequest,
    addQuestionToExam
  );

export { router as QuestionRouter };
