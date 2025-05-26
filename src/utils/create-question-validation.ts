import { body } from 'express-validator';

export const createQuestionValidation = [
  body('title')
    .isString()
    .withMessage('Title must be a string')
    .notEmpty()
    .withMessage('Title is required'),

  body('options')
    .isArray({ min: 2 })
    .withMessage('Options must be an array with at least 2 items')
    .custom((arr: any[]) => arr.every((opt) => typeof opt === 'string'))
    .withMessage('Each option must be a string'),

  body('points')
    .isInt({ min: 1 })
    .withMessage('Points must be an integer greater than 0'),

  body('answer')
    .isInt()
    .withMessage('Answer must be an integer')
    .custom((value, { req }) => {
      const options = req.body.options;
      if (!Array.isArray(options)) return false;
      return value >= 0 && value < options.length;
    })
    .withMessage('Answer must be a valid index in the options array'),
];
