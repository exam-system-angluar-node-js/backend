import express from 'express';
import cookieSession from 'cookie-session';
import { SignUpRouter, LogInRouter } from './routes/routes';

const app = express();

app.use(express.json());

app.use(cookieSession({ signed: false }));

app.get('/', (req, res) => {
  res.send('hello world');
});

app.use('/api/v1/users', SignUpRouter);
app.use('/api/v1/users', LogInRouter);

export default app;
