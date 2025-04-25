// src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import config from './types';
import { connectDB } from './config/database';
import { connectRedis } from './config/redis';
import routes from './routes';
import corsOptions from './config/cors';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { sendSuccess } from './utils/responseHandler';

const app: Application = express();

// Configure middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(helmet());
app.use(compression());
app.use(
  express.json({
    limit: '10kb', // Limit request body size
  }),
);
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Initialize database and Redis connections
const initServices = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }

  try {
    await connectRedis();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
  }
};

initServices();

// API Routes
app.use(`${config.apiPrefix}`, routes);

// Root route for base URL
app.get('/', (_req: Request, res: Response) => {
  sendSuccess(res, 200, 'Server is running', {
    name: 'Word Impact Network API',
    version: '1.0.0',
    documentation: `${config.apiPrefix}/docs`,
  });
});

// 404 handler - Use the new notFoundHandler middleware
app.use(notFoundHandler);

// Global error handler - Use the new errorHandler middleware
app.use(errorHandler);

export default app;
