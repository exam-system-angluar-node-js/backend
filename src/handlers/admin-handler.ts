import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { PrismaClient, Prisma, Result } from '../../generated/prisma/index';

// import { AppError } from '../errors/appError';

const prisma = new PrismaClient();

export const getDashboardStatsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { teacherId } = req.params;

    // Get exams created by this teacher
    const teacherExams = await prisma.exam.findMany({
      where: { userId: parseInt(teacherId) },
      select: { id: true },
    });
    const examIds = teacherExams.map((exam) => exam.id);

    // Count students who have taken this teacher's exams
    const totalStudents = await prisma.result
      .findMany({
        where: { examId: { in: examIds } },
        select: { userId: true },
        distinct: ['userId'],
      })
      .then((results) => results.length);

    const totalExams = examIds.length;

    const totalQuestions = await prisma.question.count({
      where: { examId: { in: examIds } },
    });

    const results = (await prisma.result.findMany({
      where: { examId: { in: examIds } },
    })) as Result[];

    const totalResults = results.length;
    const passedResults = results.filter((result) => result.passed).length;

    const overallPassRate =
      totalResults > 0 ? Math.round((passedResults / totalResults) * 100) : 0;

    res.status(200).json({
      status: 'success',
      data: {
        totalStudents,
        totalExams,
        totalQuestions,
        overallPassRate,
      },
    });
  }
);

export const getExamResultsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { examId } = req.params;
    const teacherId = (req as any).user?.id; // Get teacherId from authenticated user

    // Build where clause based on whether examId is provided and teacher ownership
    let whereClause: any = {};

    if (teacherId) {
      // Get exams created by this teacher
      const teacherExams = await prisma.exam.findMany({
        where: { userId: parseInt(teacherId) },
        select: { id: true },
      });
      const examIds = teacherExams.map((exam) => exam.id);

      if (examId) {
        // Filter for specific exam AND ensure it belongs to the teacher
        const examIdInt = parseInt(examId);
        if (examIds.includes(examIdInt)) {
          whereClause = { examId: examIdInt };
        } else {
          // Exam doesn't belong to teacher or doesn't exist
          return res.status(200).json([]);
        }
      } else {
        // Get results for all teacher's exams
        whereClause = { examId: { in: examIds } };
      }
    } else if (examId) {
      // Fallback if no teacher info available
      whereClause = { examId: parseInt(examId) };
    }

    const results = await prisma.result.groupBy({
      by: ['examId'],
      where: whereClause,
      _count: {
        _all: true,
      },
      _avg: {
        score: true,
      },
    });

    // If no results, return empty array or default object
    if (results.length === 0) {
      if (examId) {
        const fallbackExamId = parseInt(examId);

        // Try to fetch exam details if an ID was provided
        const exam = await prisma.exam.findUnique({
          where: { id: fallbackExamId },
          select: { id: true, title: true },
        });

        if (exam) {
          const defaultExamResult = {
            id: fallbackExamId,
            totalAttempts: 0,
            passedAttempts: 0,
            averageScore: 0,
            exam: exam,
          };
          return res.status(200).json([defaultExamResult]);
        }
      }

      return res.status(200).json([]);
    }

    // Build exam result list
    const examResults = await Promise.all(
      results.map(async (result) => {
        const exam = await prisma.exam.findUnique({
          where: { id: result.examId },
          select: { id: true, title: true },
        });

        const passedAttempts = await prisma.result.count({
          where: {
            examId: result.examId,
            passed: true,
          },
        });

        return {
          id: result.examId,
          totalAttempts: result._count._all,
          passedAttempts: passedAttempts,
          averageScore: Math.round(result._avg.score || 0),
          exam: exam || { id: result.examId, title: 'Unknown Exam' },
        };
      })
    );

    res.status(200).json(examResults);
  }
);

export const getRecentResultsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { examId } = req.params;
    const teacherId = (req as any).user?.id; // Get teacherId from authenticated user

    console.log('Request params:', req.params); // Debug log
    console.log('ExamId:', examId, 'TeacherId:', teacherId); // Debug log

    // Build where clause based on whether examId is provided and teacher ownership
    let whereClause: any = {};

    if (teacherId) {
      // Get exams created by this teacher
      const teacherExams = await prisma.exam.findMany({
        where: { userId: parseInt(teacherId) },
        select: { id: true },
      });
      const examIds = teacherExams.map((exam) => exam.id);

      if (examId) {
        // Filter for specific exam AND ensure it belongs to the teacher
        const examIdInt = parseInt(examId);
        if (examIds.includes(examIdInt)) {
          whereClause = { examId: examIdInt };
        } else {
          // Exam doesn't belong to teacher or doesn't exist
          return res.status(200).json({
            status: 'success',
            data: [],
          });
        }
      } else {
        // Get results for all teacher's exams
        whereClause = { examId: { in: examIds } };
      }
    } else if (examId) {
      // Fallback if no teacher info available
      whereClause = { examId: parseInt(examId) };
    }

    try {
      const recentResults = await prisma.result.findMany({
        where: whereClause,
        take: 50, // Increased limit to get more results when filtering
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
          exam: {
            select: {
              title: true,
            },
          },
        },
      });

      // If filtering by examId, limit to 10 results, otherwise keep more for general view
      const limitedResults = examId
        ? recentResults.slice(0, 10)
        : recentResults.slice(0, 20);

      res.status(200).json({
        status: 'success',
        data: limitedResults,
      });
    } catch (error) {
      console.error('Database error in getRecentResultsHandler:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch recent results',
      });
    }
  }
);
