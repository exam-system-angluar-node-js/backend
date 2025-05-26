import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

interface JwtPayload {
  userId: number;
  role: string;
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (
      !req.headers.authorization ||
      !req.headers.authorization?.startsWith('Bearer ')
    ) {
      res.status(401).json({
        status: 'fails',
        message: 'Unauthorized',
      });
      return;
    }

    const token = req.headers.authorization.split(' ')[1];

    const decode = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decode.userId },
    });

    if (!user) {
      res.status(401).json({
        status: 'fails',
        message: 'Unauthorized',
      });
      return;
    }

    req.user = user;
    next();
  } catch (e) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }
};
