import express, { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { logger } from './logger';

dotenv.config();

const router: express.Router = express.Router();

(router as any).get('/validate-token', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return res.status(200).json({ message: 'Token is valid', user: decoded });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
