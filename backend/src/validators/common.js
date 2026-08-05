import { body } from 'express-validator';

/**
 * Shared validator fragments reused across resource validators.
 */

/**
 * Optional trimmed string that must be <= maxLength when present.
 * @param {string} field - Body field name.
 * @param {number} maxLength - Maximum allowed length.
 * @param {string} [label] - Human-readable field label for messages.
 */
export const optionalString = (field, maxLength, label = field) => [
  body(field)
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: maxLength })
    .withMessage(`${label} must be at most ${maxLength} characters.`),
];

/**
 * Required trimmed non-empty string with an optional max length.
 * @param {string} field - Body field name.
 * @param {number} maxLength - Maximum allowed length.
 * @param {string} [label] - Human-readable field label for messages.
 */
export const requiredString = (field, maxLength, label = field) => [
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${label} is required.`)
    .isLength({ max: maxLength })
    .withMessage(`${label} must be at most ${maxLength} characters.`),
];

/**
 * Optional numeric integer bounded by min/max.
 * @param {string} field - Body field name.
 * @param {number} min - Minimum allowed value.
 * @param {number} max - Maximum allowed value.
 * @param {string} [label] - Human-readable field label for messages.
 */
export const optionalInt = (field, min, max, label = field) => [
  body(field)
    .optional({ values: 'null' })
    .isInt({ min, max })
    .withMessage(`${label} must be an integer between ${min} and ${max}.`),
];

/**
 * Optional boolean (accepts true/false or the strings "true"/"false").
 * @param {string} field - Body field name.
 */
export const optionalBoolean = (field) => [
  body(field)
    .optional({ values: 'null' })
    .isBoolean()
    .withMessage(`${field} must be a boolean.`),
];

/**
 * Optional URL string.
 * @param {string} field - Body field name.
 * @param {string} [label] - Human-readable field label for messages.
 */
export const optionalUrl = (field, label = field) => [
  body(field)
    .optional({ values: 'null' })
    .trim()
    .isURL()
    .withMessage(`${label} must be a valid URL.`),
];
