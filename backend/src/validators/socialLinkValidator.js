import { body } from 'express-validator';
import { requiredString, optionalString, optionalInt } from './common.js';

/**
 * Validation rules for creating and updating a social link.
 */
export const socialLinkValidators = {
  create: [
    ...requiredString('platform', 60),
    body('url')
      .trim()
      .notEmpty()
      .withMessage('URL is required.')
      .isURL()
      .withMessage('URL must be a valid URL.'),
    ...optionalString('icon', 255),
    ...optionalInt('displayOrder', 0, 100000),
  ],
  update: [
    ...optionalString('platform', 60),
    body('url')
      .optional({ values: 'null' })
      .trim()
      .isURL()
      .withMessage('URL must be a valid URL.'),
    ...optionalString('icon', 255),
    ...optionalInt('displayOrder', 0, 100000),
  ],
};
