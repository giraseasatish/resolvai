// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  userId: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token, authorization denied' });
    return;
  }

  // 1. Get the token
  const token = authHeader.split(' ')[1];

  // 2. SAFETY CHECK: Ensure token exists
  if (!token) {
    res.status(401).json({ message: 'Token missing' });
    return;
  }

  // 3. SAFETY CHECK: Ensure Secret exists
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in .env file");
    res.status(500).json({ message: 'Server Configuration Error' });
    return;
  }

  try {
    // 4. Verify using the guaranteed string variables
    const decoded = jwt.verify(token, secret) as UserPayload;

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};