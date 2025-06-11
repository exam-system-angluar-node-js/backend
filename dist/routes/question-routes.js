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
router.use(protect_1.protect, (0, restricto_1.restrictTo)('teacher', 'admin'));
router
    .route('/:examId')
    .get(question_handler_1.getExamQuestions) // Handled by protect and restrictTo above
    .post(create_question_validation_1.createQuestionValidation, validateRequest_1.validateRequest, question_handler_1.addQuestionToExam);
router.patch('/:questionId', question_handler_1.editQuestionHandler);
router.delete('/:questionId', question_handler_1.deleteQuestionHandler);
