import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { PrismaClient, User } from '../../generated/prisma/index';
import { NotFoundError } from '../errors/not-found-error';
import { ForbiddenError } from '../errors/forbidden-error';
import { BadRequestError } from '../errors/bad-request-error';

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

interface DashboardStats {
  totalExams: number;
  completedExams: number;
  averageScore: number;
  passRate: number;
  totalQuestions: number;
  correctAnswers: number;
}

interface RecentResult {
  id: number;
  examTitle: string;
  score: number;
  passed: boolean;
  createdAt: string;
  category: string;
  correctAnswers: number;
  totalQuestions: number;
}

interface CategoryPerformance {
  [category: string]: number;
}

interface PerformanceData {
  labels: string[];
  scores: number[];
}

// GET /api/v1/students/dashboard/stats/:studentId
export const getDashboardStatsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);
    const currentUserId = req.user?.id;
    const userRole = req.user?.role;

    if (!currentUserId) {
      throw new BadRequestError('User not authenticated');
    }

    // Ensure student can only access their own data (unless admin)
    if (userRole !== 'admin' && currentUserId !== studentId) {
      throw new ForbiddenError();
    }

    // Get total active exams
    const totalExams = await prisma.exam.count({
      where: { 
        status: 'active',
        questions: {
          some: {} // Only count exams that have at least one question
        }
      },
    });

    // Get completed exams and results for the student
    const completedResults = await prisma.result.findMany({
      where: { userId: studentId },
      include: {
        exam: {
          include: {
            questions: true,
          },
        },
      },
    });

    const completedExams = completedResults.length;

    // Calculate statistics
    let totalScore = 0;
    let passedExams = 0;
    let totalQuestions = 0;
    let correctAnswers = 0;

    completedResults.forEach((result) => {
      totalScore += result.score;
      if (result.passed) passedExams++;

      const examQuestions = result.exam.questions.length;
      totalQuestions += examQuestions;

      // Calculate correct answers based on score percentage
      correctAnswers += Math.round((result.score / 100) * examQuestions);
    });

    const averageScore = completedExams > 0 ? totalScore / completedExams : 0;
    const passRate =
      completedExams > 0 ? (passedExams / completedExams) * 100 : 0;

    const dashboardStats: DashboardStats = {
      totalExams,
      completedExams,
      averageScore: Number(averageScore.toFixed(1)),
      passRate: Number(passRate.toFixed(1)),
      totalQuestions,
      correctAnswers,
    };

    res.json(dashboardStats);
  }
);

// GET /api/v1/students/dashboard/recent-results/:studentId
export const getRecentResultsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);
    const limit = parseInt(req.query.limit as string) || 5;
    const currentUserId = req.user?.id;
    const userRole = req.user?.role;

    if (!currentUserId) {
      throw new BadRequestError('User not authenticated');
    }

    // Ensure student can only access their own data (unless admin)
    if (userRole !== 'admin' && currentUserId !== studentId) {
      throw new ForbiddenError();
    }

    const recentResults = await prisma.result.findMany({
      where: { userId: studentId },
      include: {
        exam: {
          include: {
            questions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    const formattedResults: RecentResult[] = recentResults.map((result) => {
      const totalQuestions = result.exam.questions.length;
      const correctAnswers = Math.round((result.score / 100) * totalQuestions);

      return {
        id: result.id,
        examTitle: result.exam.title,
        score: result.score,
        passed: result.passed,
        createdAt: result.createdAt.toISOString(),
        category: result.exam.category || 'General',
        correctAnswers,
        totalQuestions,
      };
    });

    res.json(formattedResults);
  }
);

// GET /api/v1/students/dashboard/score-distribution/:studentId
export const getScoreDistributionHandler = catchAsync(
  async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);
    const currentUserId = req.user?.id;
    const userRole = req.user?.role;

    if (!currentUserId) {
      throw new BadRequestError('User not authenticated');
    }

    // Ensure student can only access their own data (unless admin)
    if (userRole !== 'admin' && currentUserId !== studentId) {
      throw new ForbiddenError();
    }

    const results = await prisma.result.findMany({
      where: { userId: studentId },
      select: { score: true },
    });

    // Initialize distribution array
    const scoreDistribution = [0, 0, 0, 0, 0]; // [0-20, 21-40, 41-60, 61-80, 81-100]

    results.forEach((result) => {
      const score = result.score;
      if (score <= 20) scoreDistribution[0]++;
      else if (score <= 40) scoreDistribution[1]++;
      else if (score <= 60) scoreDistribution[2]++;
      else if (score <= 80) scoreDistribution[3]++;
      else scoreDistribution[4]++;
    });

    res.json(scoreDistribution);
  }
);

// GET /api/v1/students/dashboard/category-performance/:studentId
export const getCategoryPerformanceHandler = catchAsync(
  async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);
    const currentUserId = req.user?.id;
    const userRole = req.user?.role;

    if (!currentUserId) {
      throw new BadRequestError('User not authenticated');
    }

    // Ensure student can only access their own data (unless admin)
    if (userRole !== 'admin' && currentUserId !== studentId) {
      throw new ForbiddenError();
    }

    const results = await prisma.result.findMany({
      where: { userId: studentId },
      include: {
        exam: {
          select: {
            category: true,
          },
        },
      },
    });

    // Group results by category and calculate averages
    const categoryScores: { [category: string]: number[] } = {};

    results.forEach((result) => {
      const category = result.exam.category || 'General';
      if (!categoryScores[category]) {
        categoryScores[category] = [];
      }
      categoryScores[category].push(result.score);
    });

    const categoryPerformance: CategoryPerformance = {};

    Object.keys(categoryScores).forEach((category) => {
      const scores = categoryScores[category];
      const averageScore =
        scores.reduce((sum, score) => sum + score, 0) / scores.length;
      categoryPerformance[category] = Math.round(averageScore);
    });

    res.json(categoryPerformance);
  }
);

// GET /api/v1/students/dashboard/performance/:studentId
export const getPerformanceDataHandler = catchAsync(
  async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);
    const currentUserId = req.user?.id;
    const userRole = req.user?.role;

    if (!currentUserId) {
      throw new BadRequestError('User not authenticated');
    }

    // Ensure student can only access their own data (unless admin)
    if (userRole !== 'admin' && currentUserId !== studentId) {
      throw new ForbiddenError();
    }

    const results = await prisma.result.findMany({
      where: { userId: studentId },
      include: {
        exam: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 10,
    });

    const labels = results.map((result) =>
      new Date(result.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    );

    const scores = results.map((result) => result.score);

    const performanceData: PerformanceData = {
      labels,
      scores,
    };

    res.json(performanceData);
  }
);

// GET /api/v1/students/results/:studentId - Get all results for a student
export const getAllResultsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);
    const currentUserId = req.user?.id;
    const userRole = req.user?.role;

    if (!currentUserId) {
      throw new BadRequestError('User not authenticated');
    }

    // Ensure student can only access their own data (unless admin)
    if (userRole !== 'admin' && currentUserId !== studentId) {
      throw new ForbiddenError();
    }

    const allResults = await prisma.result.findMany({
      where: { userId: studentId },
      include: {
        exam: {
          include: {
            questions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedResults: RecentResult[] = allResults.map((result) => {
      const totalQuestions = result.exam.questions.length;
      const correctAnswers = Math.round((result.score / 100) * totalQuestions);

      return {
        id: result.id,
        examTitle: result.exam.title,
        score: result.score,
        passed: result.passed,
        createdAt: result.createdAt.toISOString(),
        category: result.exam.category || 'General',
        correctAnswers,
        totalQuestions,
      };
    });

    res.json(formattedResults);
  }
);