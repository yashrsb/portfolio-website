import { body } from 'express-validator';

/**
 * Validation rules for the login endpoint.
 * Email must be valid; password must be a non-empty string.
 */
export const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email address is required.')
    .normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required.'),
];

/**
 * Validation rules for the refresh endpoint.
 * The refresh token is read from the httpOnly cookie, so no body is needed.
 * This export exists so the route can keep its guard consistent with others.
 */
export const refreshValidator = [];
