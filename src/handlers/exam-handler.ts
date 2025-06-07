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

// GET /api/v1/exams
export const getAllExamsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const exams = await prisma.exam.findMany({
      include: {
        questions: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            // Add firstName, lastName if applicable
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const transformedExams = exams.map((exam) => ({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      category: exam.category,
      duration: exam.duration,
      questionsCount: exam.questions.length,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
      instructorName: exam.user?.name || 'Unknown Instructor',
      instructor: {
        id: exam.user?.id,
        name: exam.user?.name,
        email: exam.user?.email,
        firstName: '', // Fill if you have these fields
        lastName: '', // Fill if you have these fields
      },
    }));

    res.status(200).json(transformedExams);
  }
);

export const getAllTeacherExamsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const teacherId = req.user?.id;

    const exams = await prisma.exam.findMany({
      where: { userId: teacherId },
      include: { questions: true },
    });

    if (!exams || exams.length === 0) {
      res.json([]);
      return;
    }

    res.json(exams);
  }
);

export const createNewExamHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { title, description, startDate, duration, category } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestError('User not authenticated');
    }

    const examData = {
      title,
      description,
      startDate,
      duration,
      category,
      userId
    };

    const newExam = await prisma.exam.create({
      data: examData,
    });

    res.status(201).json({
      status: 'success',
      data: newExam,
    });
  }
);

export const editExamHandler = catchAsync(
  async (req: Request, res: Response) => {
    const examId = parseInt(req.params.examId);
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestError('User not authenticated');
    }

    const existingExam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!existingExam) {
      throw new NotFoundError();
    }

    if (existingExam.userId !== userId) {
      throw new BadRequestError('You do not have permission to edit this exam');
    }

    const { title, description, timeLimit } = req.body;

    const updatedExam = await prisma.exam.update({
      where: { id: examId },
      data: {
        title,
        description,
        duration: timeLimit, // ✅ Fixed typo here
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Exam updated successfully',
      data: updatedExam,
    });
  }
);

export const getExamById = catchAsync(async (req: Request, res: Response) => {
  const examId = parseInt(req.params.examId);
  console.log(`Attempting to fetch exam with ID: ${examId}`);

  if (isNaN(examId)) {
    console.log('Invalid exam ID provided.');
    throw new BadRequestError('Invalid exam ID');
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { questions: true },
  });

  if (!exam) {
    console.log(`Exam with ID ${examId} not found in database.`);
    throw new NotFoundError();
  }

  console.log(`Successfully fetched exam with ID: ${examId}`);
  // Remove answers for students
  if (req.user?.role === 'student') {
    const examWithoutAnswers = {
      ...exam,
      questions: exam.questions.map((question) => {
        const { answer, ...safeQuestion } = question;
        return safeQuestion;
      }),
    };
    return res.status(200).json(examWithoutAnswers);
  }

  res.status(200).json(exam);
});

export const takeExamHandler = catchAsync(
  async (req: Request, res: Response) => {
    const examId = parseInt(req.params.examId);
    const userId = req.user?.id;

    if (userId === undefined) {
      throw new BadRequestError('Provide valid user id');
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true },
    });

    if (!exam) {
      throw new NotFoundError();
    }

    const now = new Date();
    const examStartDate = new Date(exam.startDate);

    if (examStartDate > now) {
      throw new ForbiddenError('Exam has not started yet');
    }

    // Check if user has already taken this exam
    const existingResult = await prisma.result.findFirst({
      where: {
        userId,
        examId,
      },
    });

    if (existingResult) {
      const hasAnswers = await prisma.userExamAnswer.findFirst({
        where: { resultId: existingResult.id },
      });

      if (hasAnswers) {
        throw new ForbiddenError('You have already completed this exam');
      } else {
        return res.status(200).json({
          status: 'success',
          resultId: existingResult.id,
          message: 'Continuing existing exam session',
        });
      }
    }

    // Create new result record
    const result = await prisma.result.create({
      data: {
        userId,
        examId,
        score: 0,
        passed: false,
      },
    });

    // Return exam without correct answers
    const examWithoutAnswers = {
      ...exam,
      questions: exam.questions.map(({ answer, ...rest }) => rest),
    };

    res.status(200).json({
      status: 'success',
      resultId: result.id,
      exam: examWithoutAnswers,
    });
  }
);

export const submitExam = catchAsync(async (req: Request, res: Response) => {
  const resultId = parseInt(req.params.resultId);
  const result = await prisma.result.findUnique({
    where: { id: resultId },
  });

  if (!result) {
    throw new BadRequestError('Provide a valid result id');
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

  let correctAnswers = 0;
  const totalQuestions = exam?.questions.length || 0;

  exam?.questions.forEach((question) => {
    if (submittedAnswers[question.id] === question.answer) {
      correctAnswers++;
    }
  });

  // Calculate percentage score (0-100)
  // Example: 8 correct out of 10 questions = (8/10) * 100 = 80
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const passed = score >= 60; // Pass if score is 60% or higher

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

// Add this handler to your exam-handler.ts file

export const getExamResultHandler = catchAsync(
  async (req: Request, res: Response) => {
    const resultId = parseInt(req.params.resultId);
    const userId = parseInt(req.params.userId);

    if (!userId || !resultId) {
      throw new BadRequestError('Valid exam ID and user ID are required');
    }

    // Check if the user requesting is the same as the result owner or an admin/teacher
    if (
      req.user?.id !== userId &&
      req.user?.role !== 'admin' &&
      req.user?.role !== 'teacher'
    ) {
      throw new NotAuthorizedError();
    }

    // Find the result for this user and exam
    const result = await prisma.result.findFirst({
      where: {
        userId: userId,
        id: resultId,
      },
      include: {
        answers: true,
        exam: {
          include: {
            questions: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!result) {
      throw new NotFoundError();
    }

    // Check if the exam has been submitted (has answers)
    if (!result.answers) {
      throw new BadRequestError('Exam has not been completed yet');
    }

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

export const deleteExamHandler = async (req: Request, res: Response) => {
  const { examId } = req.params;

  try {
    // First, delete all related records
    await prisma.userExamAnswer.deleteMany({
      where: {
        result: {
          examId: parseInt(examId)
        }
      }
    });

    await prisma.result.deleteMany({
      where: {
        examId: parseInt(examId)
      }
    });

    await prisma.question.deleteMany({
      where: {
        examId: parseInt(examId)
      }
    });

    // Delete cheating reports
    await prisma.cheatingReport.deleteMany({
      where: {
        examId: parseInt(examId)
      }
    });

    // Finally, delete the exam
    const deletedExam = await prisma.exam.delete({
      where: {
        id: parseInt(examId)
      }
    });

    res.status(200).json({
      status: 'success',
      data: deletedExam
    });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(400).json({
      status: 'fail',
      message: 'Failed to delete exam'
    });
  }
};