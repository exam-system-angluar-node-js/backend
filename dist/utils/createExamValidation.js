"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExamValidations = void 0;
const express_validator_1 = require("express-validator");
exports.createExamValidations = [
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('startDate')
        .notEmpty()
        .withMessage('Start date is required')
        .isISO8601()
        .toDate()
        .withMessage('Start date must be a valid ISO8601 date'),
    (0, express_validator_1.body)('duration')
        .notEmpty()
        .withMessage('Duration is required')
        .isInt({ min: 1 })
        .withMessage('Duration must be a positive integer'),
    (0, express_validator_1.body)('category').notEmpty().withMessage('Category is required'),
];
