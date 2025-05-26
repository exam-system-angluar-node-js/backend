import { NextFunction, Request, Response } from 'express';
import { User } from '../../generated/prisma/index';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        status: 'fail',
        message: 'Unauthorized',
      });
      return;
    }

    if (!roles.includes(user?.role)) {
      res.status(403).json({
        status: 'fail',
        message: 'Forrbiden',
      });
      return;
    }

    next();
  };
};
