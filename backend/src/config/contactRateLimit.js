import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Contact-specific rate limiter.
 *
 * Stricter than the global limiter to protect the public contact endpoint
 * from abuse and spam bots. Values are configurable through environment
 * variables (CONTACT_RATE_LIMIT_WINDOW_MS, CONTACT_RATE_LIMIT_MAX).
 *
 * Default: 5 submissions per 15-minute window per IP.
 */
const contactRateLimiter = rateLimit({
  windowMs: env.contactRateLimit.windowMs,
  limit: env.contactRateLimit.max,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many messages sent. Please wait a while and try again.',
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      errors: [],
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id,
      },
    });
  },
});

export default contactRateLimiter;
