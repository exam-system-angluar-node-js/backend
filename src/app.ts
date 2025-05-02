import express from 'express';
import cookieSession from 'cookie-session';
import { SignUpRouter } from './routes/signup';

const app = express();

app.use(express.json());

app.use(cookieSession({ signed: false }));

app.get('/', (req, res) => {
  res.send('hello world');
});

app.use('/api/v1/users', SignUpRouter);

export default app;
