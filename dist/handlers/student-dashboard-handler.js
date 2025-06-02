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
exports.getAllResultsHandler = exports.getPerformanceDataHandler = exports.getCategoryPerformanceHandler = exports.getScoreDistributionHandler = exports.getRecentResultsHandler = exports.getDashboardStatsHandler = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const index_1 = require("../../generated/prisma/index");
const forbidden_error_1 = require("../errors/forbidden-error");
const bad_request_error_1 = require("../errors/bad-request-error");
const prisma = new index_1.PrismaClient();
// GET /api/v1/students/dashboard/stats/:studentId
exports.getDashboardStatsHandler = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const studentId = parseInt(req.params.studentId);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
    if (!currentUserId) {
        throw new bad_request_error_1.BadRequestError('User not authenticated');
    }
    // Ensure student can only access their own data (unless admin)
    if (userRole !== 'admin' && currentUserId !== studentId) {
        throw new forbidden_error_1.ForbiddenError();
    }
    // Get total active exams
    const totalExams = yield prisma.exam.count({
        where: { status: 'active' },
    });
    // Get completed exams and results for the student
    const completedResults = yield prisma.result.findMany({
        where: { userId: studentId },
        include: {
            exam: {
                include: {
                    questions: true,
                },
            },
        },
    });
    const completedExams = completedResults.length;
    // Calculate statistics
    let totalScore = 0;
    let passedExams = 0;
    let totalQuestions = 0;
    let correctAnswers = 0;
    completedResults.forEach((result) => {
        totalScore += result.score;
        if (result.passed)
            passedExams++;
        const examQuestions = result.exam.questions.length;
        totalQuestions += examQuestions;
        // Calculate correct answers based on score percentage
        correctAnswers += Math.round((result.score / 100) * examQuestions);
    });
    const averageScore = completedExams > 0 ? totalScore / completedExams : 0;
    const passRate = completedExams > 0 ? (passedExams / completedExams) * 100 : 0;
    const dashboardStats = {
        totalExams,
        completedExams,
        averageScore: averageScore.toFixed(1),
        passRate: passRate.toFixed(1),
        totalQuestions,
        correctAnswers,
    };
    res.json(dashboardStats);
}));
// GET /api/v1/students/dashboard/recent-results/:studentId
exports.getRecentResultsHandler = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const studentId = parseInt(req.params.studentId);
    const limit = parseInt(req.query.limit) || 5;
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
    if (!currentUserId) {
        throw new bad_request_error_1.BadRequestError('User not authenticated');
    }
    // Ensure student can only access their own data (unless admin)
    if (userRole !== 'admin' && currentUserId !== studentId) {
        throw new forbidden_error_1.ForbiddenError();
    }
    const recentResults = yield prisma.result.findMany({
        where: { userId: studentId },
        include: {
            exam: {
                include: {
                    questions: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: limit,
    });
    const formattedResults = recentResults.map((result) => {
        const totalQuestions = result.exam.questions.length;
        const correctAnswers = Math.round((result.score / 100) * totalQuestions);
        return {
            id: result.id,
            examTitle: result.exam.title,
            score: result.score,
            passed: result.passed,
            createdAt: result.createdAt.toISOString(),
            category: result.exam.category || 'General',
            correctAnswers,
            totalQuestions,
        };
    });
    res.json(formattedResults);
}));
// GET /api/v1/students/dashboard/score-distribution/:studentId
exports.getScoreDistributionHandler = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const studentId = parseInt(req.params.studentId);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
    if (!currentUserId) {
        throw new bad_request_error_1.BadRequestError('User not authenticated');
    }
    // Ensure student can only access their own data (unless admin)
    if (userRole !== 'admin' && currentUserId !== studentId) {
        throw new forbidden_error_1.ForbiddenError();
    }
    const results = yield prisma.result.findMany({
        where: { userId: studentId },
        select: { score: true },
    });
    // Initialize distribution array
    const scoreDistribution = [0, 0, 0, 0, 0]; // [0-20, 21-40, 41-60, 61-80, 81-100]
    results.forEach((result) => {
        const score = result.score;
        if (score <= 20)
            scoreDistribution[0]++;
        else if (score <= 40)
            scoreDistribution[1]++;
        else if (score <= 60)
            scoreDistribution[2]++;
        else if (score <= 80)
            scoreDistribution[3]++;
        else
            scoreDistribution[4]++;
    });
    res.json(scoreDistribution);
}));
// GET /api/v1/students/dashboard/category-performance/:studentId
exports.getCategoryPerformanceHandler = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const studentId = parseInt(req.params.studentId);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
    if (!currentUserId) {
        throw new bad_request_error_1.BadRequestError('User not authenticated');
    }
    // Ensure student can only access their own data (unless admin)
    if (userRole !== 'admin' && currentUserId !== studentId) {
        throw new forbidden_error_1.ForbiddenError();
    }
    const results = yield prisma.result.findMany({
        where: { userId: studentId },
        include: {
            exam: {
                select: {
                    category: true,
                },
            },
        },
    });
    // Group results by category and calculate averages
    const categoryScores = {};
    results.forEach((result) => {
        const category = result.exam.category || 'General';
        if (!categoryScores[category]) {
            categoryScores[category] = [];
        }
        categoryScores[category].push(result.score);
    });
    const categoryPerformance = {};
    Object.keys(categoryScores).forEach((category) => {
        const scores = categoryScores[category];
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        categoryPerformance[category] = Math.round(averageScore);
    });
    // Sort by performance (highest first)
    const sortedPerformance = Object.fromEntries(Object.entries(categoryPerformance).sort(([, a], [, b]) => b - a));
    res.json(sortedPerformance);
}));
// GET /api/v1/students/dashboard/performance/:studentId
exports.getPerformanceDataHandler = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const studentId = parseInt(req.params.studentId);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
    if (!currentUserId) {
        throw new bad_request_error_1.BadRequestError('User not authenticated');
    }
    // Ensure student can only access their own data (unless admin)
    if (userRole !== 'admin' && currentUserId !== studentId) {
        throw new forbidden_error_1.ForbiddenError();
    }
    const results = yield prisma.result.findMany({
        where: { userId: studentId },
        include: {
            exam: {
                select: {
                    title: true,
                },
            },
        },
        orderBy: {
            createdAt: 'asc',
        },
        take: 10,
    });
    const labels = results.map((result) => new Date(result.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    }));
    const scores = results.map((result) => result.score);
    const performanceData = {
        labels,
        scores,
    };
    res.json(performanceData);
}));
// GET /api/v1/students/results/:studentId - Get all results for a student
exports.getAllResultsHandler = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const studentId = parseInt(req.params.studentId);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
    if (!currentUserId) {
        throw new bad_request_error_1.BadRequestError('User not authenticated');
    }
    // Ensure student can only access their own data (unless admin)
    if (userRole !== 'admin' && currentUserId !== studentId) {
        throw new forbidden_error_1.ForbiddenError();
    }
    const allResults = yield prisma.result.findMany({
        where: { userId: studentId },
        include: {
            exam: {
                include: {
                    questions: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    const formattedResults = allResults.map((result) => {
        const totalQuestions = result.exam.questions.length;
        const correctAnswers = Math.round((result.score / 100) * totalQuestions);
        return {
            id: result.id,
            examTitle: result.exam.title,
            score: result.score,
            passed: result.passed,
            createdAt: result.createdAt.toISOString(),
            category: result.exam.category || 'General',
            correctAnswers,
            totalQuestions,
        };
    });
    res.json(formattedResults);
}));
