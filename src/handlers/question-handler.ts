import { NextFunction, Request, Response } from 'express';
import { PrismaClient, User } from '../../generated/prisma/index';
import { catchAsync } from '../utils/catchAsync';
import { BadRequestError } from '../errors/bad-request-error';
import { ForbiddenError } from '../errors/forbidden-error';

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
      throw new BadRequestError('enter a valid exam id');
    }

    const exam = await prisma.exam.findUnique({ where: { id: examId } });

    if (!exam) {
      throw new BadRequestError('enter a valid exam id');
    }

    if (exam.userId !== req.user?.id) {
      throw new ForbiddenError();
    }
  }
);
