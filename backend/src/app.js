import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
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

  // Response compression (gzip + brotli when client supports it)
  app.use(
    compression({
      threshold: 1024,
      brotli: { enabled: true, zlib: { level: 1 } },
      zlib: { level: 6 },
    }),
  );

  // Request ID
  app.use(requestId);

  // Cookie parsing (for refresh tokens)
  app.use(cookieParser());

  // Body parsing
  // 2 MB accommodates long-form blog post Markdown content (the largest
  // legitimate payload in the app) while still rejecting excessive bodies.
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

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
