import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

interface UserPayload {
    id: string;
    email: string;
}

declare global {
    namespace Express {
        interface Request {
            currentUser?: UserPayload;
        }
    }
}

export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }

        console.log('JWT_SECRET:', process.env.JWT_SECRET);
        console.log('Token:', token);

        const payload = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
        req.currentUser = payload;
        next();
    } catch (error) {
        console.error('JWT verification error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
}; 