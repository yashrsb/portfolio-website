import { body } from 'express-validator';
import {
  requiredString,
  optionalString,
  optionalBoolean,
  optionalInt,
} from './common.js';

/**
 * Validates a "YYYY-MM" month string used for experience dates.
 */
const monthString = (field, label) => [
  body(field)
    .optional({ values: 'null' })
    .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
    .withMessage(`${label} must be a valid YYYY-MM value.`),
];

/**
 * Validation rules for creating and updating an experience entry.
 */
export const experienceValidators = {
  create: [
    ...requiredString('company', 160),
    ...optionalString('companyWebsite', 255),
    ...requiredString('role', 120),
    ...monthString('startDate', 'Start date'),
    body('endDate')
      .optional({ values: 'null' })
      .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
      .withMessage('End date must be a valid YYYY-MM value.'),
    ...optionalBoolean('current'),
    ...optionalString('location', 160),
    ...optionalString('description', 5000),
    ...optionalInt('displayOrder', 0, 100000),
  ],
  update: [
    ...optionalString('company', 160),
    ...optionalString('companyWebsite', 255),
    ...optionalString('role', 120),
    ...monthString('startDate', 'Start date'),
    body('endDate')
      .optional({ values: 'null' })
      .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
      .withMessage('End date must be a valid YYYY-MM value.'),
    ...optionalBoolean('current'),
    ...optionalString('location', 160),
    ...optionalString('description', 5000),
    ...optionalInt('displayOrder', 0, 100000),
  ],
};
