import express from 'express';
import { protect } from '../middlewares/protect';
import { restrictTo } from '../middlewares/restricto';
import {
  addQuestionToExam,
  getExamQuestions,
  editQuestionHandler,
  deleteQuestionHandler
} from '../handlers/question-handler';
import { createQuestionValidation } from '../utils/create-question-validation';
import { validateRequest } from '../middlewares/validateRequest';

const router = express.Router();

router.use(protect, restrictTo('teacher', 'admin'));

router
  .route('/:examId')
  .get(getExamQuestions) // Handled by protect and restrictTo above
  .post(
    createQuestionValidation,
    validateRequest,
    addQuestionToExam
  );

router.patch('/:questionId', editQuestionHandler);
router.delete('/:questionId', deleteQuestionHandler);

export { router as QuestionRouter };
