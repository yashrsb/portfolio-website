import { rateLimit } from 'express-rate-limit';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Global rate limiter: 100 requests per 15 minutes per IP.
 */
const rateLimiterConfig = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many requests, please try again later.',
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      errors: [],
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id,
      },
    });
  },
});

export default rateLimiterConfig;
