import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { PrismaClient, User, Exam } from '../../generated/prisma/index';

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const getAllExamsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const exams = await prisma.exam.findMany();

    if (!exams) {
      res.json({
        status: 'sucess',
        message: 'there is no avaliable exams right now ',
      });
      return;
    }

    res.json({
      status: 'success',
      exams,
    });
  }
);

export const createNewExamHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { title, description, startDate, durration } = req.body;

    const userId = req.user?.id;

    const examData: any = { title, description, startDate, durration };
    if (userId !== undefined) examData.userId = userId;

    const newExam = await prisma.exam.create({
      data: examData,
    });

    res.status(201).json({
      status: 'success',
      data: newExam,
    });
  }
);
