import { param } from 'express-validator';

/**
 * Validates the :id route parameter as a non-empty UUID string.
 * Used by get/update/delete handlers across all admin resources.
 */
export const idValidator = [
  param('id').isUUID().withMessage('A valid resource id (UUID) is required.'),
];

/**
 * Validates the :slug route parameter as a non-empty alphanumeric string
 * that may contain hyphens (e.g. "notifyhub", "portfolio-website").
 */
export const slugValidator = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('A valid project slug is required.')
    .isSlug()
    .withMessage(
      'Slug must contain only lowercase letters, numbers, and hyphens.',
    ),
];
