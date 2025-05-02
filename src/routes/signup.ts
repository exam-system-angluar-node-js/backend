import express from 'express';
import { signupValidators } from '../utils/signupValidators';
import { validateRequest } from '../middlewares/validateRequest';
import { signupHandler } from '../handlers/signup-handler';

const router = express.Router();

router.post('/signup', signupValidators, validateRequest, signupHandler);

export { router as SignUpRouter };
