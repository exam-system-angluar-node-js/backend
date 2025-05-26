import { body } from 'express-validator';

export const createExamValidations = [
  body('title').notEmpty().withMessage('Title is required'),

  body('description').notEmpty().withMessage('Description is required'),

  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .toDate()
    .withMessage('Start date must be a valid ISO8601 date'),

  body('durration')
    .notEmpty()
    .withMessage('Duration is required')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),
];
