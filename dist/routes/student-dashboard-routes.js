"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentDashboardRouter = void 0;
const express_1 = __importDefault(require("express"));
const protect_1 = require("../middlewares/protect");
const restricto_1 = require("../middlewares/restricto");
const student_dashboard_handler_1 = require("../handlers/student-dashboard-handler");
const router = express_1.default.Router();
exports.StudentDashboardRouter = router;
// All routes require authentication
router.use(protect_1.protect);
// Dashboard statistics endpoint
router.get('/dashboard/stats/:studentId', (0, restricto_1.restrictTo)('student', 'admin'), student_dashboard_handler_1.getDashboardStatsHandler);
// Recent results endpoint
router.get('/dashboard/recent-results/:studentId', (0, restricto_1.restrictTo)('student', 'admin'), student_dashboard_handler_1.getRecentResultsHandler);
// Score distribution endpoint
router.get('/dashboard/score-distribution/:studentId', (0, restricto_1.restrictTo)('student', 'admin'), student_dashboard_handler_1.getScoreDistributionHandler);
// Category performance endpoint
router.get('/dashboard/category-performance/:studentId', (0, restricto_1.restrictTo)('student', 'admin'), student_dashboard_handler_1.getCategoryPerformanceHandler);
// Performance data endpoint (for charts)
router.get('/dashboard/performance/:studentId', (0, restricto_1.restrictTo)('student', 'admin'), student_dashboard_handler_1.getPerformanceDataHandler);
// All results endpoint
router.get('/results/:studentId', (0, restricto_1.restrictTo)('student', 'admin'), student_dashboard_handler_1.getAllResultsHandler);
