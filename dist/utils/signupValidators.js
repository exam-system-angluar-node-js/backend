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
exports.signupValidators = exports.loginValidators = void 0;
const express_validator_1 = require("express-validator");
const prisma_1 = require("../../generated/prisma");
const prisma = new prisma_1.PrismaClient();
const VALID_NAME_REGEX = /^[A-Za-z]+(?:[ '\-][A-Za-z]+)*$/;
const ROLES = ['student', 'teacher'];
const PASSWORD_MIN_LENGTH = 6;
exports.loginValidators = [
    (0, express_validator_1.body)('email')
        .trim()
        .normalizeEmail()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format'),
    (0, express_validator_1.body)('password').trim().notEmpty().withMessage('Password is required'),
];
exports.signupValidators = [
    (0, express_validator_1.body)('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 3 })
        .withMessage('Name must be at least 3 characters')
        .matches(VALID_NAME_REGEX)
        .withMessage('Invalid name format'),
    (0, express_validator_1.body)('email')
        .trim()
        .normalizeEmail()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .custom((email) => __awaiter(void 0, void 0, void 0, function* () {
        const existingUser = yield prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('Invalid cardentional');
        }
        return true;
    })),
    (0, express_validator_1.body)('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: PASSWORD_MIN_LENGTH })
        .withMessage(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`),
    (0, express_validator_1.body)('confirmPassword')
        .trim()
        .notEmpty()
        .withMessage('Confirm password is required')
        .custom((confirmPassword, { req }) => {
        if (confirmPassword !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
    (0, express_validator_1.body)('role')
        .trim()
        .notEmpty()
        .withMessage('Role is required')
        .isIn(ROLES)
        .withMessage(`Invalid role. Valid roles: ${ROLES.join(', ')}`),
];
