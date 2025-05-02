import express, { Request, Response } from 'express';
import { loginValidators } from '../utils/signupValidators';
import { validateRequest } from '../middlewares/validateRequest';
import { loginHandler } from '../handlers/login-handler';

const router = express.Router();

router.post('/login', loginValidators, validateRequest, loginHandler);

export { router as LogInRouter };
