import { body } from 'express-validator';
import {
  requiredString,
  optionalString,
  optionalUrl,
  optionalBoolean,
  optionalInt,
} from './common.js';

/**
 * Validation rules for creating and updating a project.
 */
export const projectValidators = {
  create: [
    ...requiredString('title', 120),
    ...requiredString('slug', 160),
    ...optionalString('summary', 500),
    ...optionalString('description', 5000),
    ...optionalUrl('githubUrl', 'GitHub URL'),
    ...optionalUrl('demoUrl', 'Demo URL'),
    ...optionalUrl('imageUrl', 'Image URL'),
    body('status')
      .optional({ values: 'null' })
      .isIn(['live', 'wip', 'archived'])
      .withMessage('Status must be one of: live, wip, archived.'),
    ...optionalBoolean('featured'),
    ...optionalInt('displayOrder', 0, 100000),
  ],
  update: [
    ...optionalString('title', 120),
    ...optionalString('slug', 160),
    ...optionalString('summary', 500),
    ...optionalString('description', 5000),
    ...optionalUrl('githubUrl', 'GitHub URL'),
    ...optionalUrl('demoUrl', 'Demo URL'),
    ...optionalUrl('imageUrl', 'Image URL'),
    body('status')
      .optional({ values: 'null' })
      .isIn(['live', 'wip', 'archived'])
      .withMessage('Status must be one of: live, wip, archived.'),
    ...optionalBoolean('featured'),
    ...optionalInt('displayOrder', 0, 100000),
  ],
};
