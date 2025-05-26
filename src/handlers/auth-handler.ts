import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma, User } from '../../generated/prisma/index';
import { Password } from '../utils/Password';
import jwt from 'jsonwebtoken';
import { BadRequestError } from '../errors/bad-request-error';
import { catchAsync } from '../utils/catchAsync';

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

export const loginHandler = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new BadRequestError('Invalid Credential');
  }

  const isPasswordMatch = await Password.compare(user.password, password);

  if (!isPasswordMatch) {
    throw new BadRequestError('Invalid Credential');
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  req.user = user;
  console.log(req.user);

  res.status(200).json({ user, token });
});

export const signupHandler = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, role } = req.body;
    const isUserExiste = await prisma.user.findFirst({ where: { email } });

    if (isUserExiste) {
      throw new BadRequestError('invalid credential');
    }

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
  }
);
