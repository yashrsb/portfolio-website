import express from 'express';
import cors from 'cors';
import compression from 'compression';
import {
  corsOptions,
  helmetConfig,
  rateLimiterConfig,
} from './config/index.js';
import routes from './routes/index.js';
import {
  requestId,
  requestLogger,
  errorHandler,
  notFound,
} from './middlewares/index.js';

/**
 * Creates and configures the Express application.
 * @returns {import('express').Express} Configured app.
 */
const createApp = () => {
  const app = express();

  app.disable('x-powered-by');

  // Security headers
  app.use(helmetConfig);

  // CORS
  app.use(cors(corsOptions));

  // Response compression
  app.use(compression());

  // Request ID
  app.use(requestId);

  // Body parsing
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // HTTP request logging
  app.use(requestLogger);

  // Global rate limiting
  app.use(rateLimiterConfig);

  // Versioned API routes
  app.use(routes);

  // 404 fallback
  app.use(notFound);

  // Centralized error handler
  app.use(errorHandler);

  return app;
};

const app = createApp();

export default app;
export { createApp };
