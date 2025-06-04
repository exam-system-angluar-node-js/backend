import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma/index';
import { catchAsync } from '../utils/catchAsync';
import { BadRequestError } from '../errors/bad-request-error';

const prisma = new PrismaClient();

// Handler to receive cheating reports
export const createCheatingReportHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { studentId, examId, cheatingType } = req.body;

    if (!studentId || !examId || !cheatingType) {
      throw new BadRequestError('Missing required fields: studentId, examId, cheatingType');
    }

    const cheatingReport = await prisma.cheatingReport.create({
      data: {
        studentId: parseInt(studentId),
        examId: parseInt(examId),
        cheatingType,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Cheating report created successfully',
      data: cheatingReport,
    });
  }
);

// Handler to get all cheating reports (for admin)
export const getAllCheatingReportsHandler = catchAsync(
  async (req: Request, res: Response) => {
    const cheatingReports = await prisma.cheatingReport.findMany({
      orderBy: {
        timestamp: 'desc',
      },
    });

    res.status(200).json(cheatingReports);
  }
); 