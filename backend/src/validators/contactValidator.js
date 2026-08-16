import { body } from 'express-validator';

/**
 * Validation rules for POST /contact.
 *
 * The validator enforces field-level constraints (required, length, email
 * format) on the four user-visible fields. The hidden honeypot field
 * (`website`) is intentionally NOT validated here — it is checked by the
 * spamProtection middleware, which silently rejects the request if the
 * honeypot carries a value.
 */
export const contactValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .escape(),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail(),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 5, max: 150 })
    .withMessage('Subject must be between 5 and 150 characters')
    .escape(),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
    .escape(),
];
