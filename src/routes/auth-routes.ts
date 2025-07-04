import express from 'express';
import { loginValidators, signupValidators } from '../utils/signupValidators';
import { validateRequest } from '../middlewares/validateRequest';
import { protect } from '../middlewares/protect';
import { updateProfile, deleteAccount } from '../handlers/auth-handler';

import {
  currentUser,
  loginHandler,
  signupHandler,
  getUserByIdHandler,
  getAllUsersHandler,
} from '../handlers/auth-handler';
import { restrictTo } from '../middlewares/restricto';

const router = express.Router();

router.post('/login', loginValidators, validateRequest, loginHandler);
router.post('/signup', signupValidators, validateRequest, signupHandler);
router.get('/profile', protect, currentUser);


// Route to get all users (admin and teacher only)
router.get('/', protect, restrictTo('admin', 'teacher'), getAllUsersHandler);
router.patch('/me', protect, updateProfile);
router.delete('/me', protect, deleteAccount);

// Route to get a user by ID (admin and teacher only)
router.get('/:userId', protect, restrictTo('admin', 'teacher'), getUserByIdHandler);

export { router as AuthRouter };




