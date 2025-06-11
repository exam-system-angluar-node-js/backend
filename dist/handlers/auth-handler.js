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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.getAllUsersHandler = exports.getUserByIdHandler = exports.signupHandler = exports.loginHandler = exports.currentUser = exports.updateProfile = void 0;
const index_1 = require("../../generated/prisma/index");
const Password_1 = require("../utils/Password");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bad_request_error_1 = require("../errors/bad-request-error");
const catchAsync_1 = require("../utils/catchAsync");
const not_found_error_1 = require("../errors/not-found-error");
const prisma = new index_1.PrismaClient();
exports.updateProfile = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const { avatar, name, email } = req.body;
    const updatedUser = yield prisma.user.update({
        where: { id: userId },
        data: Object.assign(Object.assign(Object.assign({}, (avatar && { avatar })), (name && { name })), (email && { email })),
    });
    res.status(200).json({ success: true, user: updatedUser });
}));
const currentUser = (req, res, next) => {
    console.log(req.user);
    if (req.user) {
        console.log(req.user);
        res.send(req.user);
    }
    else {
        res.json({
            status: 'success',
            user: null,
        });
    }
};
exports.currentUser = currentUser;
exports.loginHandler = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (!user) {
        throw new bad_request_error_1.BadRequestError('Invalid Credential');
    }
    const isPasswordMatch = yield Password_1.Password.compare(user.password, password);
    if (!isPasswordMatch) {
        throw new bad_request_error_1.BadRequestError('Invalid Credential');
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    req.user = user;
    console.log(req.user);
    res.status(200).json({ user, token });
}));
exports.signupHandler = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, role } = req.body;
    const isUserExiste = yield prisma.user.findFirst({ where: { email } });
    if (isUserExiste) {
        throw new bad_request_error_1.BadRequestError('invalid credential');
    }
    const hashedPassword = yield Password_1.Password.hash(password);
    const user = yield prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role,
        },
    });
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    req.user = user;
    res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
    });
}));
// Handler to get a user by ID (for admin and teacher)
exports.getUserByIdHandler = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.params.userId);
    console.log(`Attempting to fetch user with ID: ${userId}`);
    if (isNaN(userId)) {
        console.log('Invalid user ID provided.');
        throw new bad_request_error_1.BadRequestError('Invalid user ID');
    }
    const user = yield prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });
    if (!user) {
        console.log(`User with ID ${userId} not found in database.`);
        throw new not_found_error_1.NotFoundError();
    }
    console.log(`Successfully fetched user with ID: ${userId}`);
    res.status(200).json(user);
}));
// Handler to get all users (for admin and teacher)
exports.getAllUsersHandler = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        },
    });
    // Get exam results for each user
    const usersWithResults = yield Promise.all(users.map((user) => __awaiter(void 0, void 0, void 0, function* () {
        const results = yield prisma.result.findMany({
            where: { userId: user.id },
            select: {
                score: true,
                passed: true,
            },
        });
        const totalExams = results.length;
        const passedExams = results.filter(r => r.passed).length;
        const averageScore = totalExams > 0
            ? results.reduce((acc, curr) => acc + curr.score, 0) / totalExams
            : 0;
        return Object.assign(Object.assign({}, user), { examResults: {
                totalExams,
                passedExams,
                averageScore,
            } });
    })));
    res.status(200).json({
        status: 'success',
        data: usersWithResults,
    });
}));
exports.deleteAccount = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    if (!userId) {
        throw new bad_request_error_1.BadRequestError('User not authenticated');
    }
    // Delete all related records first
    yield prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        // First get all result IDs for this user
        const userResults = yield prisma.result.findMany({
            where: { userId },
            select: { id: true }
        });
        const resultIds = userResults.map(result => result.id);
        // Delete all user exam answers associated with the user's results
        yield prisma.userExamAnswer.deleteMany({
            where: {
                resultId: {
                    in: resultIds
                }
            }
        });
        // Now delete all results associated with the user
        yield prisma.result.deleteMany({
            where: { userId }
        });
        // Delete all cheating reports where the user is the student
        yield prisma.cheatingReport.deleteMany({
            where: { studentId: userId }
        });
        // Delete all exams created by the user
        yield prisma.exam.deleteMany({
            where: { userId }
        });
        // Finally delete the user
        yield prisma.user.delete({
            where: { id: userId }
        });
    }));
    res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
    });
}));
