import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * 404 fallback for unknown routes.
 */
const notFound = (req, _res, next) => {
  next(
    new ApiError(
      HTTP_STATUS.NOT_FOUND,
      `Route ${req.method} ${req.originalUrl} not found`,
      ERROR_CODES.NOT_FOUND,
    ),
  );
};

export default notFound;
