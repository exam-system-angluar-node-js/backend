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
exports.addQuestionToExam = exports.getExamQuestions = void 0;
const index_1 = require("../../generated/prisma/index");
const catchAsync_1 = require("../utils/catchAsync");
const bad_request_error_1 = require("../errors/bad-request-error");
const forbidden_error_1 = require("../errors/forbidden-error");
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
