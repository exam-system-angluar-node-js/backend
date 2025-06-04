import { NextFunction, Request, Response } from 'express';
import { PrismaClient, User } from '../../generated/prisma/index';
import { catchAsync } from '../utils/catchAsync';
import { BadRequestError } from '../errors/bad-request-error';
import { ForbiddenError } from '../errors/forbidden-error';
import { NotFoundError } from '../errors/not-found-error';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const prisma = new PrismaClient();

export const getExamQuestions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const examId = parseInt(req.params.examId);

    if (!examId) {
      throw new BadRequestError('enter a valid exam id');
    }

    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      throw new BadRequestError('enter a valid exam id');
    }

    const userRole = req.user?.role;
    const userId = req.user?.id;

    // Check permissions based on user role
    if (userRole === 'teacher' || userRole === 'admin') {
      // Teachers/admins can only access their own exams
      if (exam.userId !== userId) {
        throw new ForbiddenError();
      }
    } else if (userRole === 'student') {
      // Students can access questions if they have an active exam session
      const activeResult = await prisma.result.findFirst({
        where: {
          userId,
          examId,
        },
      });

      if (!activeResult) {
        throw new ForbiddenError('You must start the exam first');
      }

      // Check if exam has started
      const now = new Date();
      const examStartDate = new Date(exam.startDate);

      if (examStartDate > now) {
        throw new ForbiddenError('Exam has not started yet');
      }
    } else {
      throw new ForbiddenError();
    }

    const questions = await prisma.question.findMany({
      where: { examId },
      select: {
        id: true,
        title: true,
        options: true,
        points: true,
        examId: true,
        // Include answer only for teachers/admins
        ...(userRole === 'student' ? {} : { answer: true }),
      },
    });

    res.json(questions);
  }
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
    const questions = req.body.questions;

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new BadRequestError('Questions must be a non-empty array');
    }

    const createdQuestions = await prisma.question.createMany({
      data: questions.map((q) => ({
        title: q.title,
        options: q.options,
        points: q.points,
        answer: q.answer,
        examId,
      })),
    });

    res.status(201).json({
      status: 'success',
      message: `${createdQuestions.count} questions added`,
    });
  }
);

export const editQuestionHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const questionId = parseInt(req.params.questionId);
    const userId = req.user?.id;
    const updatedQuestionData = req.body;

    if (!questionId) {
      throw new BadRequestError('Invalid question id');
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { exam: true }
    });

    if (!question) {
      throw new NotFoundError();
    }

    // Check if the user is the owner of the exam the question belongs to
    if (question.exam.userId !== userId) {
      throw new ForbiddenError();
    }

    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: updatedQuestionData,
    });

    res.status(200).json({
      status: 'success',
      message: 'Question updated successfully',
      data: updatedQuestion,
    });
  }
);

export const deleteQuestionHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const questionId = parseInt(req.params.questionId);
    const userId = req.user?.id;

    if (!questionId) {
      throw new BadRequestError('Invalid question id');
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { exam: true }
    });

    if (!question) {
      throw new NotFoundError();
    }

    // Check if the user is the owner of the exam the question belongs to
    if (question.exam.userId !== userId) {
      throw new ForbiddenError();
    }

    await prisma.question.delete({
      where: { id: questionId },
    });

    res.status(204).json({
      status: 'success',
      message: 'Question deleted successfully',
      data: null
    });
  }
);
