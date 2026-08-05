import { body } from 'express-validator';
import { requiredString, optionalString, optionalInt } from './common.js';

const VALID_CATEGORIES = [
  'Languages',
  'Frontend',
  'Backend',
  'Databases',
  'Cloud',
  'Tools',
];

/**
 * Validation rules for creating and updating a skill.
 */
export const skillValidators = {
  create: [
    ...requiredString('name', 80),
    body('category')
      .notEmpty()
      .withMessage('Category is required.')
      .isIn(VALID_CATEGORIES)
      .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}.`),
    body('proficiency')
      .isInt({ min: 1, max: 100 })
      .withMessage('Proficiency must be an integer between 1 and 100.'),
    ...optionalString('icon', 255),
    ...optionalInt('displayOrder', 0, 100000),
  ],
  update: [
    ...optionalString('name', 80),
    body('category')
      .optional({ values: 'null' })
      .isIn(VALID_CATEGORIES)
      .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}.`),
    body('proficiency')
      .optional({ values: 'null' })
      .isInt({ min: 1, max: 100 })
      .withMessage('Proficiency must be an integer between 1 and 100.'),
    ...optionalString('icon', 255),
    ...optionalInt('displayOrder', 0, 100000),
  ],
};
