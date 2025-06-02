"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionRouter = void 0;
const express_1 = __importDefault(require("express"));
const protect_1 = require("../middlewares/protect");
const restricto_1 = require("../middlewares/restricto");
const question_handler_1 = require("../handlers/question-handler");
const create_question_validation_1 = require("../utils/create-question-validation");
const validateRequest_1 = require("../middlewares/validateRequest");
const router = express_1.default.Router();
exports.QuestionRouter = router;
router
    .route('/:examId')
    .get(protect_1.protect, question_handler_1.getExamQuestions) // Allow all authenticated users (students, teachers, admins)
    .post(protect_1.protect, (0, restricto_1.restrictTo)('teacher', 'admin'), // Only teachers/admins can add questions
create_question_validation_1.createQuestionValidation, validateRequest_1.validateRequest, question_handler_1.addQuestionToExam);
