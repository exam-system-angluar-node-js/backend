import { body } from 'express-validator';
import { PrismaClient } from '../../generated/prisma';
const prisma = new PrismaClient();

const VALID_NAME_REGEX = /^[A-Za-z]+(?:[ '\-][A-Za-z]+)*$/;
const ROLES = ['student', 'teacher'];
const PASSWORD_MIN_LENGTH = 6;

export const loginValidators = [
  body('email')
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  body('password').trim().notEmpty().withMessage('Password is required'),
];

export const signupValidators = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters')
    .matches(VALID_NAME_REGEX)
    .withMessage('Invalid name format'),

  body('email')
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .custom(async (email: string) => {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new Error('Invalid cardentional');
      }
      return true;
    }),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: PASSWORD_MIN_LENGTH })
    .withMessage(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`),

  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((confirmPassword: string, { req }) => {
      if (confirmPassword !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isIn(ROLES)
    .withMessage(`Invalid role. Valid roles: ${ROLES.join(', ')}`),
];
