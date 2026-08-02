import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Runs express-validator rules and returns a 400 with
 * structured field errors when validation fails.
 */
const validateRequest = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const fieldErrors = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));

    const error = new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Validation failed',
      ERROR_CODES.VALIDATION_ERROR,
      fieldErrors,
    );
    next(error);
    return;
  }
  next();
};

export default validateRequest;
