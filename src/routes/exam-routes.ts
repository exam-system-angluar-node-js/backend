import express from 'express';
import { protect } from '../middlewares/protect';
import {
  createNewExamHandler,
  editExamHandler,
  getAllExamsHandler,
  getAllTeacherExamsHandler,
  getExamById,
  submitExam,
  takeExamHandler,
  getExamResultHandler,
} from '../handlers/exam-handler';
import { restrictTo } from '../middlewares/restricto';
import { createExamValidations } from '../utils/createExamValidation';
import { validateRequest } from '../middlewares/validateRequest';
import { validateEditExam } from '../utils/edit-exam-validation';

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

router.get(
  '/teacher',
  protect,
  restrictTo('teacher', 'admin'),
  getAllTeacherExamsHandler
);

// IMPORTANT: Place specific routes BEFORE generic parameterized routes
router.get('/result/:examId/:userId', protect, getExamResultHandler);

router.get(
  '/take-exam/:examId',
  protect,
  restrictTo('student'),
  takeExamHandler
);



router.post('/submit/:resultId', protect, restrictTo('student'), submitExam);

// Generic routes should come AFTER specific ones
router
  .route('/:examId')
  .get(protect, getExamById) // Accessible to all authenticated users
  .patch(
    protect,
    restrictTo('teacher'),
    validateEditExam,
    validateRequest,
    editExamHandler
  )


 


export { router as ExamRouter };
