"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamRouter = void 0;
const express_1 = __importDefault(require("express"));
const protect_1 = require("../middlewares/protect");
const exam_handler_1 = require("../handlers/exam-handler");
const restricto_1 = require("../middlewares/restricto");
const createExamValidation_1 = require("../utils/createExamValidation");
const validateRequest_1 = require("../middlewares/validateRequest");
const edit_exam_validation_1 = require("../utils/edit-exam-validation");
const router = express_1.default.Router();
exports.ExamRouter = router;
router
    .route('/')
    .get(protect_1.protect, exam_handler_1.getAllExamsHandler)
    .post(protect_1.protect, (0, restricto_1.restrictTo)('teacher', 'admin'), createExamValidation_1.createExamValidations, validateRequest_1.validateRequest, exam_handler_1.createNewExamHandler);
router.get('/teacher', protect_1.protect, (0, restricto_1.restrictTo)('teacher', 'admin'), exam_handler_1.getAllTeacherExamsHandler);
// IMPORTANT: Place specific routes BEFORE generic parameterized routes
router.get('/result/:resultId/:userId', protect_1.protect, exam_handler_1.getExamResultHandler);
router.get('/take-exam/:examId', protect_1.protect, (0, restricto_1.restrictTo)('student'), exam_handler_1.takeExamHandler);
router.post('/submit/:resultId', protect_1.protect, (0, restricto_1.restrictTo)('student'), exam_handler_1.submitExam);
// Generic routes should come AFTER specific ones
router
    .route('/:examId')
    .get(protect_1.protect, exam_handler_1.getExamById) // Accessible to all authenticated users
    .patch(protect_1.protect, (0, restricto_1.restrictTo)('teacher', 'admin'), edit_exam_validation_1.validateEditExam, validateRequest_1.validateRequest, exam_handler_1.editExamHandler)
    .delete(protect_1.protect, (0, restricto_1.restrictTo)('teacher', 'admin'), exam_handler_1.deleteExamHandler);
