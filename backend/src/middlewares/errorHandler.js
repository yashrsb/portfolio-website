import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

const PRISMA_UNIQUE_CONSTRAINT = 'P2002';
const PRISMA_RECORD_NOT_FOUND = 'P2025';
const PRISMA_CONNECTION_ERRORS = new Set(['P1000', 'P1001', 'P1002', 'P1017']);

// Multer error codes for file upload constraints.
const MULTER_LIMIT_FILE_SIZE = 'LIMIT_FILE_SIZE';
const MULTER_LIMIT_UNEXPECTED_FILE = 'LIMIT_UNEXPECTED_FILE';
const MULTER_LIMIT_FILE_COUNT = 'LIMIT_FILE_COUNT';
const PRISMA_DATABASE_UNAVAILABLE_ERRORS = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ENOTFOUND',
  'ETIMEDOUT',
  'P1000',
  'P1001',
  'P1002',
  'P1017',
]);

/**
 * Detects whether an error originated from the Prisma query engine.
 * @param {Error} err - Original error.
 * @returns {boolean} True when the error is Prisma-related.
 */
const isPrismaError = (err) =>
  typeof err?.code === 'string' && /^P\d{4}$/.test(err.code);

/**
 * Maps a Prisma error code to an ApiError.
 * @param {{ code: string }} err - Prisma error.
 * @returns {ApiError} Normalized ApiError.
 */
const mapPrismaError = (err) => {
  if (err.code === PRISMA_UNIQUE_CONSTRAINT) {
    return new ApiError(
      HTTP_STATUS.CONFLICT,
      'A record with the same unique value already exists.',
      ERROR_CODES.CONFLICT,
    );
  }

  if (err.code === PRISMA_RECORD_NOT_FOUND) {
    return new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'The requested record was not found.',
      ERROR_CODES.NOT_FOUND,
    );
  }

  if (PRISMA_CONNECTION_ERRORS.has(err.code)) {
    return new ApiError(
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      'The database is currently unavailable. Please try again later.',
      ERROR_CODES.DATABASE_UNAVAILABLE,
    );
  }

  return null;
};

/**
 * Maps a raw error (e.g. body-parser SyntaxError) to an ApiError.
 * @param {Error} err - Original error.
 * @returns {ApiError} Normalized ApiError.
 */
const normalizeError = (err) => {
  if (err instanceof ApiError) {
    return err;
  }

  if (isPrismaError(err)) {
    const mapped = mapPrismaError(err);
    if (mapped) {
      return mapped;
    }
  }

  // Multer file-upload constraint errors.
  if (err.code === MULTER_LIMIT_FILE_SIZE) {
    return new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'The uploaded file exceeds the maximum allowed size of 5 MB.',
      ERROR_CODES.FILE_TOO_LARGE,
    );
  }

  if (
    err.code === MULTER_LIMIT_UNEXPECTED_FILE ||
    err.code === MULTER_LIMIT_FILE_COUNT
  ) {
    return new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Exactly one file must be uploaded.',
      ERROR_CODES.INVALID_FILE_TYPE,
    );
  }

  // Node.js connection-level failures surface as system errors.
  if (
    typeof err?.code === 'string' &&
    PRISMA_DATABASE_UNAVAILABLE_ERRORS.has(err.code)
  ) {
    return new ApiError(
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      'The database is currently unavailable. Please try again later.',
      ERROR_CODES.DATABASE_UNAVAILABLE,
    );
  }

  // body-parser raises SyntaxError with status 400 for malformed JSON
  if (
    err.type === 'entity.parse.failed' ||
    err.status === HTTP_STATUS.BAD_REQUEST
  ) {
    return new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Invalid request payload. Please check the request body.',
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  return new ApiError(
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    'An unexpected error occurred.',
    ERROR_CODES.INTERNAL_SERVER_ERROR,
  );
};

/**
 * Centralized error handling middleware.
 * Must be registered after all routes.
 */
const errorHandler = (err, req, res, _next) => {
  const error = normalizeError(err);

  if (error.statusCode >= 500) {
    logger.error('Unhandled error', {
      message: err.message,
      stack: err.stack,
      requestId: req.id,
    });
  }

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    code: error.code,
    errors: error.errors,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.id,
    },
  });
};

export default errorHandler;
