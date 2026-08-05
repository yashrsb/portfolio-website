import { body } from 'express-validator';
import { requiredString, optionalString, optionalInt } from './common.js';

/**
 * Validation rules for creating and updating an education entry.
 */
export const educationValidators = {
  create: [
    ...requiredString('institution', 160),
    ...requiredString('degree', 160),
    ...optionalString('field', 160),
    body('startYear')
      .isInt({ min: 1950, max: 2100 })
      .withMessage('Start year must be a valid year (1950-2100).'),
    body('endYear')
      .isInt({ min: 1950, max: 2100 })
      .withMessage('End year must be a valid year (1950-2100).'),
    ...optionalString('description', 5000),
    ...optionalInt('displayOrder', 0, 100000),
  ],
  update: [
    ...optionalString('institution', 160),
    ...optionalString('degree', 160),
    ...optionalString('field', 160),
    body('startYear')
      .optional({ values: 'null' })
      .isInt({ min: 1950, max: 2100 })
      .withMessage('Start year must be a valid year (1950-2100).'),
    body('endYear')
      .optional({ values: 'null' })
      .isInt({ min: 1950, max: 2100 })
      .withMessage('End year must be a valid year (1950-2100).'),
    ...optionalString('description', 5000),
    ...optionalInt('displayOrder', 0, 100000),
  ],
};
