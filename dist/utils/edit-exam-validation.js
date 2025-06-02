"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEditExam = void 0;
const express_validator_1 = require("express-validator");
exports.validateEditExam = [
    (0, express_validator_1.body)('title').optional().isString().withMessage('Title must be a string'),
    (0, express_validator_1.body)('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),
    (0, express_validator_1.body)('timeLimit')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Time limit must be a positive integer'),
];
