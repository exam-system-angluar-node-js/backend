import { body } from 'express-validator';

export const createQuestionValidation = [
  body('questions')
    .isArray({ min: 1 })
    .withMessage('Questions must be a non-empty array'),

  body('questions.*.title')
    .isString()
    .withMessage('Each question title must be a string')
    .notEmpty()
    .withMessage('Each question must have a title'),

  body('questions.*.options')
    .isArray({ min: 2 })
    .withMessage('Each question must have at least two options')
    .custom((arr: any[]) => arr.every((opt) => typeof opt === 'string'))
    .withMessage('Each option must be a string'),

  body('questions.*.points')
    .isInt({ min: 1 })
    .withMessage("Each question's points must be an integer greater than 0"),

  body('questions.*.answer').custom((value, { req, path }) => {
    const index = parseInt(path.match(/\d+/)?.[0] || '', 10);
    const question = req.body.questions[index];
    const numericAnswer =
      typeof value === 'string' ? parseInt(value, 10) : value;

    if (
      typeof numericAnswer !== 'number' ||
      isNaN(numericAnswer) ||
      numericAnswer < 0 ||
      numericAnswer >= question.options.length
    ) {
      throw new Error(
        'Each answer must be a valid index in the corresponding options array'
      );
    }
    return true;
  }),
];
