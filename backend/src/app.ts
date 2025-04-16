import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import config from './config';
import { connectDB } from './config/database';
import { connectRedis } from './config/redis';
import routes from './routes';

const app: Application = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    message: 'Server is running test sandesh',
    documentation: `${config.apiPrefix}/docs`,
  });
});

// API Routes
app.use(config.apiPrefix, routes);

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
