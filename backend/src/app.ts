import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import config from './types';
import { connectDB } from './config/database';
import { connectRedis } from './config/redis';
import routes from './routes';

const app: Application = express();

// Configure middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database and Redis connections
const initServices = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('Database connection failed:', error);
  }

  try {
    await connectRedis();
  } catch (error) {
    console.error('Redis connection failed:', error);
  }
};

initServices();

// Root route for base URL
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    documentation: `${config.apiPrefix}/docs`,
  });
});

// Register API routes
app.use(routes);

// 404 handler
app.use((req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.originalUrl}`,
    availableRoutes: {
      root: '/',
      documentation: `${config.apiPrefix}/docs`,
    },
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
});

export default app;
