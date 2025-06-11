"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_session_1 = __importDefault(require("cookie-session"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = require("./routes/auth-routes");
const exam_routes_1 = require("./routes/exam-routes");
const question_routes_1 = require("./routes/question-routes");
const admin_routes_1 = require("./routes/admin-routes");
const student_dashboard_routes_1 = require("./routes/student-dashboard-routes");
const cheating_report_routes_1 = require("./routes/cheating-report-routes");
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const error_handler_1 = require("./middlewares/error-handler");
const app = (0, express_1.default)();
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, cookie_session_1.default)({ signed: false }));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Serve static files from the uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.get('/', (req, res) => {
    res.send('hello world');
});
app.use('/api/v1/users', auth_routes_1.AuthRouter);
app.use('/api/v1/exams', exam_routes_1.ExamRouter);
app.use('/api/v1/questions', question_routes_1.QuestionRouter);
app.use('/api/v1/admin', admin_routes_1.AdminRouter);
app.use('/api/v1/students', student_dashboard_routes_1.StudentDashboardRouter);
app.use('/api/v1/cheating-reports', cheating_report_routes_1.CheatingReportRouter);
app.use('/api/v1/upload', uploadRoutes_1.default);
app.use(error_handler_1.errorHandler);
exports.default = app;
