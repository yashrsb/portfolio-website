import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Analytics ingestion rate limiter.
 *
 * Protects the public analytics endpoint from abuse (fake event flooding).
 * Configurable via ANALYTICS_RATE_LIMIT_WINDOW_MS and
 * ANALYTICS_RATE_LIMIT_MAX.
 *
 * Default: 60 events per minute per IP.
 */
const analyticsRateLimiter = rateLimit({
  windowMs: env.analytics.rateLimit.windowMs,
  limit: env.analytics.rateLimit.max,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many analytics events. Please slow down.',
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      errors: [],
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id,
      },
    });
  },
});

export default analyticsRateLimiter;
