import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Honeypot field names hidden from real users via CSS.
 * Automated bots that fill all form fields will trigger these.
 */
const HONEYPOT_FIELDS = ['website', 'url'];

/**
 * Spam-protection middleware using a honeypot technique.
 *
 * If any honeypot field carries a value, the request is silently rejected
 * with a generic error — no details about which rule triggered are exposed.
 *
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} _res - Express response (unused).
 * @param {import('express').NextFunction} next - Express next callback.
 */
const spamProtection = (req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const field of HONEYPOT_FIELDS) {
      const value = req.body[field];
      if (value && String(value).trim().length > 0) {
        logger.warn('Spam detected via honeypot field', {
          ipAddress: req.ip,
          requestId: req.id,
        });
        return next(
          new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            'Invalid submission.',
            ERROR_CODES.SPAM_REJECTED,
          ),
        );
      }
    }
  }
  next();
};

export default spamProtection;
