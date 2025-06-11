"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
const express_1 = __importDefault(require("express"));
const signupValidators_1 = require("../utils/signupValidators");
const validateRequest_1 = require("../middlewares/validateRequest");
const protect_1 = require("../middlewares/protect");
const auth_handler_1 = require("../handlers/auth-handler");
const auth_handler_2 = require("../handlers/auth-handler");
const restricto_1 = require("../middlewares/restricto");
const router = express_1.default.Router();
exports.AuthRouter = router;
router.post('/login', signupValidators_1.loginValidators, validateRequest_1.validateRequest, auth_handler_2.loginHandler);
router.post('/signup', signupValidators_1.signupValidators, validateRequest_1.validateRequest, auth_handler_2.signupHandler);
router.get('/profile', protect_1.protect, auth_handler_2.currentUser);
// Route to get all users (admin and teacher only)
router.get('/', protect_1.protect, (0, restricto_1.restrictTo)('admin', 'teacher'), auth_handler_2.getAllUsersHandler);
router.patch('/me', protect_1.protect, auth_handler_1.updateProfile);
router.delete('/me', protect_1.protect, auth_handler_1.deleteAccount);
// Route to get a user by ID (admin and teacher only)
router.get('/:userId', protect_1.protect, (0, restricto_1.restrictTo)('admin', 'teacher'), auth_handler_2.getUserByIdHandler);
