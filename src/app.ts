import express from 'express';
import cookieSession from 'cookie-session';

import cors from 'cors';
import { AuthRouter } from './routes/auth-routes';
import { ExamRouter } from './routes/exam-routes';
import { QuestionRouter } from './routes/question-routes';

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieSession({ signed: false }));

app.get('/', (req, res) => {
  res.send('hello world');
});

app.use('/api/v1/users', AuthRouter);
app.use('/api/v1/exams', ExamRouter);
app.use('/api/v1/questions', QuestionRouter);


export default app;
