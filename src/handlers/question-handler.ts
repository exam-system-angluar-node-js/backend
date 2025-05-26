import { NextFunction, Request, Response } from 'express';
import { PrismaClient, User } from '../../generated/prisma/index';
import { catchAsync } from '../utils/catchAsync';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const prisma = new PrismaClient();

export const getExamQuestions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const addQuestionToExam = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const examId = parseInt(req.params.examId);

    if (!examId) {
      res.status(400).json({
        status: 'fails',
        message: 'provide a valid exam id',
      });
      return;
    }

    const exam = await prisma.exam.findUnique({ where: { id: examId } });

    if (!exam) {
      res.status(400).json({
        status: 'fails',
        message: 'provide a valid exam id',
      });
      return;
    }

    if (exam.userId !== req.user?.id) {
      res.status(403).json({
        status: 'fails',
        message: 'Forrbidden',
      });
      return;
    }
    
  }
);
