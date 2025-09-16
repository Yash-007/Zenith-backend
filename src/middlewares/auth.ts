import { NextFunction, Request, Response } from "express";
import { ErrorResponse } from "../types/common.types";
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
    userId?: string;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): (Response<ErrorResponse> | void) => {
    const token = req.headers['X-Auth-Token'] as string;
    if (!token) {
        return res.status(401).json({
            message: 'Unauthorized',
            success: false
        } as ErrorResponse);
    }
    try {
       const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {userId: string};
       req.userId = payload.userId;
       next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({
            message: 'Unauthorized',
            success: false
        } as ErrorResponse);
    }
}