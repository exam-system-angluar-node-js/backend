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
  .all(protect, restrictTo('teacher', 'admin'))
  .get(getExamQuestions)
  .post(createQuestionValidation, validateRequest, addQuestionToExam);

export { router as QuestionRouter };
