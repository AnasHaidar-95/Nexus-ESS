import app from './app.js';
import { config } from './config/index.js';
import { logger } from './core/utils/logger.js';
import { prisma } from './core/utils/prisma.js';
import { loadPermissionsCache } from './core/utils/permission-cache.js';
import { connectRedis, disconnectRedis } from './core/cache/redis.js';

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully.');

    // Connect to Redis (non-blocking — continues if unavailable)
    await connectRedis();

    await loadPermissionsCache();
    logger.info('Permission cache loaded successfully.');

    const server = app.listen(config.port, () => {
      logger.info(`ESS Backend server running in [${config.env}] mode on port ${config.port}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectRedis();
        await prisma.$disconnect();
        logger.info('Server shut down.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();
