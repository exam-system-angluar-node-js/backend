"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuestionHandler = exports.editQuestionHandler = exports.addQuestionToExam = exports.getExamQuestions = void 0;
const index_1 = require("../../generated/prisma/index");
const catchAsync_1 = require("../utils/catchAsync");
const bad_request_error_1 = require("../errors/bad-request-error");
const forbidden_error_1 = require("../errors/forbidden-error");
const not_found_error_1 = require("../errors/not-found-error");
const prisma = new index_1.PrismaClient();
exports.getExamQuestions = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const examId = parseInt(req.params.examId);
    if (!examId) {
        throw new bad_request_error_1.BadRequestError('enter a valid exam id');
    }
    const exam = yield prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
        throw new bad_request_error_1.BadRequestError('enter a valid exam id');
    }
    const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    // Check permissions based on user role
    if (userRole === 'teacher' || userRole === 'admin') {
        // Teachers/admins can only access their own exams
        if (exam.userId !== userId) {
            throw new forbidden_error_1.ForbiddenError();
        }
    }
    else if (userRole === 'student') {
        // Students can access questions if they have an active exam session
        const activeResult = yield prisma.result.findFirst({
            where: {
                userId,
                examId,
            },
        });
        if (!activeResult) {
            throw new forbidden_error_1.ForbiddenError('You must start the exam first');
        }
        // Check if exam has started
        const now = new Date();
        const examStartDate = new Date(exam.startDate);
        if (examStartDate > now) {
            throw new forbidden_error_1.ForbiddenError('Exam has not started yet');
        }
    }
    else {
        throw new forbidden_error_1.ForbiddenError();
    }
    const questions = yield prisma.question.findMany({
        where: { examId },
        select: Object.assign({ id: true, title: true, options: true, points: true, examId: true }, (userRole === 'student' ? {} : { answer: true })),
    });
    res.json(questions);
}));
exports.addQuestionToExam = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const examId = parseInt(req.params.examId);
    if (!examId) {
        throw new bad_request_error_1.BadRequestError('enter a valid exam id');
    }
    const exam = yield prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
        throw new bad_request_error_1.BadRequestError('enter a valid exam id');
    }
    if (exam.userId !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        throw new forbidden_error_1.ForbiddenError();
    }
    const questions = req.body.questions;
    if (!Array.isArray(questions) || questions.length === 0) {
        throw new bad_request_error_1.BadRequestError('Questions must be a non-empty array');
    }
    const createdQuestions = yield prisma.question.createMany({
        data: questions.map((q) => ({
            title: q.title,
            options: q.options,
            points: q.points,
            answer: q.answer,
            examId,
        })),
    });
    res.status(201).json({
        status: 'success',
        message: `${createdQuestions.count} questions added`,
    });
}));
exports.editQuestionHandler = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const questionId = parseInt(req.params.questionId);
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const updatedQuestionData = req.body;
    if (!questionId) {
        throw new bad_request_error_1.BadRequestError('Invalid question id');
    }
    const question = yield prisma.question.findUnique({
        where: { id: questionId },
        include: { exam: true }
    });
    if (!question) {
        throw new not_found_error_1.NotFoundError();
    }
    // Check if the user is the owner of the exam the question belongs to
    if (question.exam.userId !== userId) {
        throw new forbidden_error_1.ForbiddenError();
    }
    const updatedQuestion = yield prisma.question.update({
        where: { id: questionId },
        data: updatedQuestionData,
    });
    res.status(200).json({
        status: 'success',
        message: 'Question updated successfully',
        data: updatedQuestion,
    });
}));
exports.deleteQuestionHandler = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const questionId = parseInt(req.params.questionId);
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!questionId) {
        throw new bad_request_error_1.BadRequestError('Invalid question id');
    }
    const question = yield prisma.question.findUnique({
        where: { id: questionId },
        include: { exam: true }
    });
    if (!question) {
        throw new not_found_error_1.NotFoundError();
    }
    // Check if the user is the owner of the exam the question belongs to
    if (question.exam.userId !== userId) {
        throw new forbidden_error_1.ForbiddenError();
    }
    yield prisma.question.delete({
        where: { id: questionId },
    });
    res.status(204).json({
        status: 'success',
        message: 'Question deleted successfully',
        data: null
    });
}));
