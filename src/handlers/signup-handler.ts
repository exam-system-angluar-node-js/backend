import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, Prisma } from '../../generated/prisma';
import asyncHandler from 'express-async-handler';
import { Password } from '../utils/Password';

const prisma = new PrismaClient();

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

      req.session = { jwt: token };

      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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
