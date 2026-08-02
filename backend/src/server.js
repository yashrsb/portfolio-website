import app from './app.js';
import { env } from './config/env.js';
import logger from './utils/logger.js';

const server = app.listen(env.port, () => {
  logger.info(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
  logger.info(`API available at http://localhost:${env.port}${env.apiPrefix}`);
});

/**
 * Gracefully shuts down the server.
 * @param {string} signal - Termination signal.
 */
const shutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });

  // Force exit if connections do not close within 10 seconds
  setTimeout(() => {
    logger.error('Forcing shutdown after timeout.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export { server };
