import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { prisma } from './config/db.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler, AppError } from './middleware/errorHandler.js';
import { sendSuccess } from './utils/response.js';
import { apiRouter } from './modules/index.js';

export function createApp(): Express {
  const app = express();

  // Security & utility middleware
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // Health check endpoint
  app.get('/api/health', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate database connectivity
      await prisma.$queryRaw`SELECT 1`;

      return sendSuccess(
        res,
        {
          system: 'Healthagram Clinical Management System API',
          status: 'healthy',
          database: 'connected',
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
          environment: env.NODE_ENV
        },
        'Health check succeeded'
      );
    } catch (error) {
      next(new AppError('Database connection check failed during health check', 503, error));
    }
  });

  // Mount API Domain Routes
  app.use(env.API_PREFIX, apiRouter);

  // Catch-all 404 handler for unmatched routes
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
  });

  // Global error handler
  app.use(errorHandler);

  return app;
}
