"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuestionValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createQuestionValidation = [
    (0, express_validator_1.body)('questions')
        .isArray({ min: 1 })
        .withMessage('Questions must be a non-empty array'),
    (0, express_validator_1.body)('questions.*.title')
        .isString()
        .withMessage('Each question title must be a string')
        .notEmpty()
        .withMessage('Each question must have a title'),
    (0, express_validator_1.body)('questions.*.options')
        .isArray({ min: 2 })
        .withMessage('Each question must have at least two options')
        .custom((arr) => arr.every((opt) => typeof opt === 'string'))
        .withMessage('Each option must be a string'),
    (0, express_validator_1.body)('questions.*.points')
        .isInt({ min: 1 })
        .withMessage("Each question's points must be an integer greater than 0"),
    (0, express_validator_1.body)('questions.*.answer').custom((value, { req, path }) => {
        var _a;
        const index = parseInt(((_a = path.match(/\d+/)) === null || _a === void 0 ? void 0 : _a[0]) || '', 10);
        const question = req.body.questions[index];
        const numericAnswer = typeof value === 'string' ? parseInt(value, 10) : value;
        if (typeof numericAnswer !== 'number' ||
            isNaN(numericAnswer) ||
            numericAnswer < 0 ||
            numericAnswer >= question.options.length) {
            throw new Error('Each answer must be a valid index in the corresponding options array');
        }
        return true;
    }),
];
