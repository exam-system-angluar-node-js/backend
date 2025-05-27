import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { PrismaClient, User, Exam } from '../../generated/prisma/index';
import { NotFoundError } from '../errors/not-found-error';
import { ForbiddenError } from '../errors/forbidden-error';
import { BadRequestError } from '../errors/bad-request-error';
import { NotAuthorizedError } from '../errors/not-authorized-error';

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
    const { title, description, startDate, durration, category } = req.body;

    const userId = req.user?.id;

    const examData: any = {
      title,
      description,
      startDate,
      durration,
      category,
    };
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

export const takeExamHandler = catchAsync(
  async (req: Request, res: Response) => {
    const examId = parseInt(req.params.examId);
    const userId = req.user?.id;

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true },
    });

    if (!exam) {
      throw new NotFoundError();
    }

    const existingResult = await prisma.result.findFirst({
      where: { userId, examId },
    });

    if (existingResult) {
      throw new ForbiddenError();
    }

    const date = new Date();
    const examStartDate = new Date(exam.startDate);

    if (examStartDate > date) {
      throw new ForbiddenError();
    }

    if (userId === undefined) {
      throw new BadRequestError('provide valid user id');
    }

    const result = await prisma.result.create({
      data: {
        userId,
        examId,
        score: 0,
        passed: false,
      },
    });

    res.status(200).json({
      status: 'success',
      resultId: result.id,
    });
  }
);

export const submitExam = catchAsync(async (req: Request, res: Response) => {
  const resultId = parseInt(req.params.resultId);
  const result = await prisma.result.findUnique({
    where: { id: resultId },
  });

  if (!result) {
    throw new BadRequestError('provide a valida result id');
  }

  if (result.userId !== req.user?.id) {
    throw new NotAuthorizedError();
  }

  const exam = await prisma.exam.findUnique({
    where: { id: result.examId },
    include: { questions: true },
  });

  const submittedAnswers: { [questionId: number]: number } = req.body.answers;

  if (!submittedAnswers || typeof submittedAnswers !== 'object') {
    throw new BadRequestError(
      'Answers must be provided in the correct format.'
    );
  }

  let score = 0;
  let totalPoints = 0;

  exam?.questions.forEach((question) => {
    totalPoints += question.points;
    if (submittedAnswers[question.id] === question.answer) {
      score += question.points;
    }
  });

  const passed = score >= totalPoints * 0.6;

  const updatedResult = await prisma.result.update({
    where: { id: resultId },
    data: {
      score,
      passed,
      answers: {
        create: {
          answer: JSON.stringify(submittedAnswers),
        },
      },
    },
    include: {
      answers: true,
    },
  });

  res.status(200).json({
    status: 'success',
    result: updatedResult,
  });
});
