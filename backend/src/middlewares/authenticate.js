import { verifyAccessToken } from '../services/tokenService.js';
import { findUserById } from '../repositories/authRepository.js';
import ApiError from '../utils/ApiError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Express middleware that authenticates requests via a Bearer JWT access token.
 * On success, attaches the resolved user to `req.user` and the token payload to `req.auth`.
 *
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} _res - Express response.
 * @param {import('express').NextFunction} next - Express next callback.
 */
const authenticate = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new ApiError(
        401,
        'Authentication required. Provide a valid access token.',
        ERROR_CODES.UNAUTHORIZED,
      );
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new ApiError(
        401,
        'Access token is invalid or expired.',
        ERROR_CODES.UNAUTHORIZED,
      );
    }

    const user = await findUserById(payload.sub);
    if (!user || !user.isActive) {
      throw new ApiError(
        401,
        'Account no longer available.',
        ERROR_CODES.UNAUTHORIZED,
      );
    }

    req.auth = payload;
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
