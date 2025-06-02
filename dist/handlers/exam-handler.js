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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExamResultHandler = exports.submitExam = exports.takeExamHandler = exports.getExamById = exports.editExamHandler = exports.createNewExamHandler = exports.getAllTeacherExamsHandler = exports.getAllExamsHandler = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const index_1 = require("../../generated/prisma/index");
const not_found_error_1 = require("../errors/not-found-error");
const forbidden_error_1 = require("../errors/forbidden-error");
const bad_request_error_1 = require("../errors/bad-request-error");
const not_authorized_error_1 = require("../errors/not-authorized-error");
const prisma = new index_1.PrismaClient();
// GET /api/v1/exams
exports.getAllExamsHandler = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const exams = yield prisma.exam.findMany({
        include: {
            questions: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    // Add firstName, lastName if applicable
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    const transformedExams = exams.map((exam) => {
        var _a, _b, _c, _d;
        return ({
            id: exam.id,
            title: exam.title,
            description: exam.description,
            category: exam.category,
            duration: exam.duration,
            questionsCount: exam.questions.length,
            createdAt: exam.createdAt,
            updatedAt: exam.updatedAt,
            instructorName: ((_a = exam.user) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown Instructor',
            instructor: {
                id: (_b = exam.user) === null || _b === void 0 ? void 0 : _b.id,
                name: (_c = exam.user) === null || _c === void 0 ? void 0 : _c.name,
                email: (_d = exam.user) === null || _d === void 0 ? void 0 : _d.email,
                firstName: '', // Fill if you have these fields
                lastName: '', // Fill if you have these fields
            },
        });
    });
    res.status(200).json(transformedExams);
}));
exports.getAllTeacherExamsHandler = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const teacherId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const exams = yield prisma.exam.findMany({
        where: { userId: teacherId },
        include: { questions: true },
    });
    if (!exams || exams.length === 0) {
        res.json([]);
        return;
    }
    res.json(exams);
}));
exports.createNewExamHandler = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { title, description, startDate, duration, category } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const examData = {
        title,
        description,
        startDate,
        duration,
        category,
    };
    if (userId !== undefined)
        examData.userId = userId;
    const newExam = yield prisma.exam.create({
        data: examData,
    });
    res.status(201).json({
        status: 'success',
        data: newExam,
    });
}));
exports.editExamHandler = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const examId = parseInt(req.params.examId);
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        throw new bad_request_error_1.BadRequestError('User not authenticated');
    }
    const existingExam = yield prisma.exam.findUnique({
        where: { id: examId },
    });
    if (!existingExam) {
        throw new not_found_error_1.NotFoundError();
    }
    if (existingExam.userId !== userId) {
        throw new bad_request_error_1.BadRequestError('You do not have permission to edit this exam');
    }
    const { title, description, timeLimit } = req.body;
    const updatedExam = yield prisma.exam.update({
        where: { id: examId },
        data: {
            title,
            description,
            duration: timeLimit, // ✅ Fixed typo here
        },
    });
    res.status(200).json({
        status: 'success',
        message: 'Exam updated successfully',
        data: updatedExam,
    });
}));
exports.getExamById = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const examId = parseInt(req.params.examId);
    const exam = yield prisma.exam.findUnique({
        where: { id: examId },
        include: { questions: true },
    });
    if (!exam)
        throw new not_found_error_1.NotFoundError();
    // Remove answers for students
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'student') {
        const examWithoutAnswers = Object.assign(Object.assign({}, exam), { questions: exam.questions.map((question) => {
                const { answer } = question, safeQuestion = __rest(question, ["answer"]);
                return safeQuestion;
            }) });
        return res.status(200).json(examWithoutAnswers);
    }
    res.status(200).json(exam);
}));
// export const getExamById = catchAsync(async (req: Request, res: Response) => {
//   const examId = parseInt(req.params.examId);
//   const userId = req.user?.id;
//   const exam = await prisma.exam.findUnique({
//     where: { id: examId },
//     include: { questions: true },
//   });
//   if (!exam) {
//     throw new NotFoundError();
//   }
//   if (userId === undefined) {
//     throw new BadRequestError('Provide valid user id');
//   }
//   res.status(200).json(exam);
// });
exports.takeExamHandler = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const examId = parseInt(req.params.examId);
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (userId === undefined) {
        throw new bad_request_error_1.BadRequestError('Provide valid user id');
    }
    const exam = yield prisma.exam.findUnique({
        where: { id: examId },
        include: { questions: true },
    });
    if (!exam) {
        throw new not_found_error_1.NotFoundError();
    }
    const now = new Date();
    const examStartDate = new Date(exam.startDate);
    if (examStartDate > now) {
        throw new forbidden_error_1.ForbiddenError('Exam has not started yet');
    }
    // Check if user has already taken this exam
    const existingResult = yield prisma.result.findFirst({
        where: {
            userId,
            examId,
        },
    });
    if (existingResult) {
        const hasAnswers = yield prisma.userExamAnswer.findFirst({
            where: { resultId: existingResult.id },
        });
        if (hasAnswers) {
            throw new forbidden_error_1.ForbiddenError('You have already completed this exam');
        }
        else {
            return res.status(200).json({
                status: 'success',
                resultId: existingResult.id,
                message: 'Continuing existing exam session',
            });
        }
    }
    // Create new result record
    const result = yield prisma.result.create({
        data: {
            userId,
            examId,
            score: 0,
            passed: false,
        },
    });
    // Return exam without correct answers
    const examWithoutAnswers = Object.assign(Object.assign({}, exam), { questions: exam.questions.map((_a) => {
            var { answer } = _a, rest = __rest(_a, ["answer"]);
            return rest;
        }) });
    res.status(200).json({
        status: 'success',
        resultId: result.id,
        exam: examWithoutAnswers,
    });
}));
exports.submitExam = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const resultId = parseInt(req.params.resultId);
    const result = yield prisma.result.findUnique({
        where: { id: resultId },
    });
    if (!result) {
        throw new bad_request_error_1.BadRequestError('Provide a valid result id');
    }
    if (result.userId !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        throw new not_authorized_error_1.NotAuthorizedError();
    }
    const exam = yield prisma.exam.findUnique({
        where: { id: result.examId },
        include: { questions: true },
    });
    const submittedAnswers = req.body.answers;
    if (!submittedAnswers || typeof submittedAnswers !== 'object') {
        throw new bad_request_error_1.BadRequestError('Answers must be provided in the correct format.');
    }
    let score = 0;
    let totalPoints = 0;
    exam === null || exam === void 0 ? void 0 : exam.questions.forEach((question) => {
        totalPoints += question.points;
        if (submittedAnswers[question.id] === question.answer) {
            score += question.points;
        }
    });
    const passed = score >= totalPoints * 0.6;
    const updatedResult = yield prisma.result.update({
        where: { id: resultId },
        data: {
            score,
            passed,
            answers: {
                create: {
                    answer: JSON.stringify(submittedAnswers),
                },
            },
        },
        include: {
            answers: true,
        },
    });
    res.status(200).json({
        status: 'success',
        result: updatedResult,
    });
}));
// Add this handler to your exam-handler.ts file
exports.getExamResultHandler = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const examId = parseInt(req.params.examId);
    const userId = parseInt(req.params.userId);
    if (!userId || !examId) {
        throw new bad_request_error_1.BadRequestError('Valid exam ID and user ID are required');
    }
    // Check if the user requesting is the same as the result owner or an admin/teacher
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== userId &&
        ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin' &&
        ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) !== 'teacher') {
        throw new not_authorized_error_1.NotAuthorizedError();
    }
    // Find the result for this user and exam
    const result = yield prisma.result.findFirst({
        where: {
            userId: userId,
            examId: examId,
        },
        include: {
            answers: true,
            exam: {
                include: {
                    questions: true,
                },
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
    if (!result) {
        throw new not_found_error_1.NotFoundError();
    }
    // Check if the exam has been submitted (has answers)
    if (!result.answers) {
        throw new bad_request_error_1.BadRequestError('Exam has not been completed yet');
    }
    res.status(200).json({
        status: 'success',
        data: result,
    });
}));
