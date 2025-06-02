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
exports.signupHandler = exports.loginHandler = exports.currentUser = void 0;
const index_1 = require("../../generated/prisma/index");
const Password_1 = require("../utils/Password");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bad_request_error_1 = require("../errors/bad-request-error");
const catchAsync_1 = require("../utils/catchAsync");
const prisma = new index_1.PrismaClient();
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
