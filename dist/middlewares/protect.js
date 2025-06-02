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
exports.protect = void 0;
const prisma_1 = require("../../generated/prisma");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new prisma_1.PrismaClient();
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.headers.authorization ||
            !((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.startsWith('Bearer '))) {
            res.status(401).json({
                status: 'fails',
                message: 'Unauthorized',
            });
            return;
        }
        const token = req.headers.authorization.split(' ')[1];
        const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = yield prisma.user.findUnique({
            where: { id: decode.userId },
        });
        if (!user) {
            res.status(401).json({
                status: 'fails',
                message: 'Unauthorized',
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (e) {
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
    }
});
exports.protect = protect;
