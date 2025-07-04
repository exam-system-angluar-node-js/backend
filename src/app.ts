import express from 'express';
import cookieSession from 'cookie-session';
import morgan from 'morgan';
import path from 'path';
import cors from 'cors';
import { AuthRouter } from './routes/auth-routes';
import { ExamRouter } from './routes/exam-routes';
import { QuestionRouter } from './routes/question-routes';
import { AdminRouter } from './routes/admin-routes';
import { StudentDashboardRouter } from './routes/student-dashboard-routes';
import { CheatingReportRouter } from './routes/cheating-report-routes';
import uploadRoutes from './routes/uploadRoutes';
import { errorHandler } from './middlewares/error-handler';

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
app.use(cookieSession({ signed: false }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.send('hello world');
});

app.use('/api/v1/users', AuthRouter);
app.use('/api/v1/exams', ExamRouter);
app.use('/api/v1/questions', QuestionRouter);
app.use('/api/v1/admin', AdminRouter);
app.use('/api/v1/students', StudentDashboardRouter);
app.use('/api/v1/cheating-reports', CheatingReportRouter);
app.use('/api/v1/upload', uploadRoutes);

app.use(errorHandler);

export default app;
