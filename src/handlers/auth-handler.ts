import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { PrismaClient, Prisma, User } from '../../generated/prisma/index';
import { Password } from '../utils/Password';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.user);

  if (req.user) {
    console.log(req.user);
    res.send(req.user);
  } else {
    res.json({
      status: 'success',
      user: null,
    });
  }
};

export const loginHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new Error('Invalid Credential');
    }

    const isPasswordMatch = await Password.compare(user.password, password);

    if (!isPasswordMatch) {
      throw new Error('Invalid Credential');
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    req.user = user;
    console.log(req.user);

    res.status(200).json({ user, token });
  }
);

export const signupHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, role } = req.body;

    try {
      const hashedPassword = await Password.hash(password);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
      });

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      req.user = user;

      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    } catch (error: any) {
      console.error('Signup Error:', error);

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        res.status(409).json({ message: 'Email already exists' });
        return;
      }

      res.status(500).json({ message: 'Internal server error' });
    }
  }
);
