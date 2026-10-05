import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  try {
    // 1. Ensure database connectivity
    await connectDatabase();

    // 2. Instantiate and start Express application
    const app = createApp();

    const server = app.listen(env.PORT, () => {
      logger.info(`Healthagram API Server running on http://localhost:${env.PORT}`);
      logger.info(`Health check endpoint: http://localhost:${env.PORT}/api/health`);
      logger.info(`API Base route: http://localhost:${env.PORT}${env.API_PREFIX}`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        logger.info('Database disconnected and server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.error('Failed to start Healthagram API server:', error);
    process.exit(1);
  }
}

bootstrap();
