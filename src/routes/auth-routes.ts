import express from 'express';
import { loginValidators, signupValidators } from '../utils/signupValidators';
import { validateRequest } from '../middlewares/validateRequest';
import { protect } from '../middlewares/protect';
import {
  currentUser,
  loginHandler,
  signupHandler,
} from '../handlers/auth-handler';

const router = express.Router();

router.post('/login', loginValidators, validateRequest, loginHandler);
router.post('/signup', signupValidators, validateRequest, signupHandler);
router.get('/profile', protect, currentUser);

export { router as AuthRouter };
