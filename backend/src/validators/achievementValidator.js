import { body } from 'express-validator';
import { requiredString, optionalString, optionalInt } from './common.js';

/**
 * Validation rules for creating and updating an achievement.
 */
export const achievementValidators = {
  create: [
    ...requiredString('title', 160),
    ...requiredString('organization', 160),
    body('year')
      .isInt({ min: 1950, max: 2100 })
      .withMessage('Year must be a valid year (1950-2100).'),
    ...optionalString('description', 2000),
  ],
  update: [
    ...optionalString('title', 160),
    ...optionalString('organization', 160),
    body('year')
      .optional({ values: 'null' })
      .isInt({ min: 1950, max: 2100 })
      .withMessage('Year must be a valid year (1950-2100).'),
    ...optionalString('description', 2000),
    ...optionalInt('displayOrder', 0, 100000),
  ],
};
