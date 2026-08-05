import { param } from 'express-validator';

/**
 * Validates the :id route parameter as a non-empty UUID string.
 * Used by get/update/delete handlers across all admin resources.
 */
export const idValidator = [
  param('id').isUUID().withMessage('A valid resource id (UUID) is required.'),
];
