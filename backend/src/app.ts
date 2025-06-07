import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
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
import validateToken from './utils/validateToken';

const app: Application = express();
dotenv.config();

// middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(helmet());
app.use(compression());

app.use(
  express.json({
    limit: '10kb',
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
app.use(`${config.apiPrefix}`, validateToken);

// Root route for base URL
app.get('/', (_req: Request, res: Response) => {
  sendSuccess(res, 200, 'Server is running', {
    name: 'Word Impact Network API',
    version: '1.0.0',
    documentation: `${config.apiPrefix}/docs`,
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
