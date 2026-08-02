import { env } from './env.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

// Admin runs on :5174 alongside the public frontend on :5173.
const DEFAULT_FRONTEND_URLS = 'http://localhost:5173,http://localhost:5174';

const allowedOrigins = (env.frontendUrl || DEFAULT_FRONTEND_URLS)
  .split(',')
  .map((origin) => origin.trim());

/**
 * CORS configuration. Only allows origins declared in FRONTEND_URL.
 */
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    const error = new ApiError(
      HTTP_STATUS.FORBIDDEN,
      'Origin not allowed by CORS',
      ERROR_CODES.FORBIDDEN,
    );
    callback(error);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
  credentials: true,
  maxAge: 86400,
};

export default corsOptions;
