"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRouter = void 0;
const express_1 = __importDefault(require("express"));
const protect_1 = require("../middlewares/protect");
const restricto_1 = require("../middlewares/restricto");
const admin_handler_1 = require("../handlers/admin-handler");
const router = express_1.default.Router();
exports.AdminRouter = router;
router.use(protect_1.protect, (0, restricto_1.restrictTo)('teacher'));
router.get('/dashboard/stats/:teacherId', admin_handler_1.getDashboardStatsHandler);
router.get('/dashboard/exam-results', admin_handler_1.getExamResultsHandler);
router.get('/dashboard/exam-results/:examId', admin_handler_1.getExamResultsHandler);
router.get('/dashboard/recent-results', admin_handler_1.getRecentResultsHandler);
router.get('/dashboard/recent-results/:examId', admin_handler_1.getRecentResultsHandler);
// Add delete student route
router.delete('/students/:studentId', admin_handler_1.deleteStudentHandler);
