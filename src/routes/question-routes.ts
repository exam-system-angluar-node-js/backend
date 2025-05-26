import express from 'express';
import { protect } from '../middlewares/protect';
import { restrictTo } from '../middlewares/restricto';
import {
  addQuestionToExam,
  getExamQuestions,
} from '../handlers/question-handler';

const router = express.Router();

router
  .route('/:examId')
  .all(protect, restrictTo('teacher', 'admin'))
  .get(getExamQuestions)
  .post(addQuestionToExam);

export { router as QuestionRouter };
