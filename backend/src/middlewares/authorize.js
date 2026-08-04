import ApiError from '../utils/ApiError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Factory that creates an authorization middleware enforcing the given roles.
 *
 * @param {...string} roles - Allowed roles, e.g. authorize('ADMIN') or authorize('ADMIN', 'EDITOR').
 * @returns {import('express').RequestHandler} Express middleware.
 */
const authorize = (...roles) => {
  const allowed = new Set(roles);

  return (req, _res, next) => {
    if (!req.user || !allowed.has(req.user.role)) {
      next(
        new ApiError(
          403,
          'You do not have permission to perform this action.',
          ERROR_CODES.FORBIDDEN,
        ),
      );
      return;
    }
    next();
  };
};

export default authorize;

