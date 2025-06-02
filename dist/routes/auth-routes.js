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
const router = express_1.default.Router();
exports.AuthRouter = router;
router.post('/login', signupValidators_1.loginValidators, validateRequest_1.validateRequest, auth_handler_1.loginHandler);
router.post('/signup', signupValidators_1.signupValidators, validateRequest_1.validateRequest, auth_handler_1.signupHandler);
router.get('/profile', protect_1.protect, auth_handler_1.currentUser);
