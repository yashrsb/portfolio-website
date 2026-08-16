import { body } from 'express-validator';
import {
  requiredString,
  optionalString,
  optionalUrl,
  optionalBoolean,
  optionalInt,
} from './common.js';

/**
 * Optional array of strings — validates that, if present, the value is an
 * array of non-empty strings.
 * @param {string} field - Body field name.
 * @param {string} [label] - Human-readable field label for messages.
 */
const optionalStringArray = (field, label = field) => [
  body(field)
    .optional({ values: 'null' })
    .isArray()
    .withMessage(`${label} must be an array.`)
    .custom((arr) => arr.every((v) => typeof v === 'string' && v.trim()))
    .withMessage(`${label} must contain only non-empty strings.`),
];

/**
 * Optional JSON object — validates that, if present, the value is an object.
 * @param {string} field - Body field name.
 * @param {string} [label] - Human-readable field label for messages.
 */
const optionalJsonObject = (field, label = field) => [
  body(field)
    .optional({ values: 'null' })
    .isObject()
    .withMessage(`${label} must be a JSON object.`),
];

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
    ...optionalUrl('architectureImage', 'Architecture Image URL'),
    ...optionalString('architecture', 5000),
    ...optionalStringArray('features', 'Features'),
    ...optionalStringArray('challenges', 'Challenges'),
    ...optionalStringArray('lessonsLearned', 'Lessons Learned'),
    ...optionalJsonObject('techStack', 'Tech Stack'),
    ...optionalJsonObject('screenshots', 'Screenshots'),
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
    ...optionalUrl('architectureImage', 'Architecture Image URL'),
    ...optionalString('architecture', 5000),
    ...optionalStringArray('features', 'Features'),
    ...optionalStringArray('challenges', 'Challenges'),
    ...optionalStringArray('lessonsLearned', 'Lessons Learned'),
    ...optionalJsonObject('techStack', 'Tech Stack'),
    ...optionalJsonObject('screenshots', 'Screenshots'),
    body('status')
      .optional({ values: 'null' })
      .isIn(['live', 'wip', 'archived'])
      .withMessage('Status must be one of: live, wip, archived.'),
    ...optionalBoolean('featured'),
    ...optionalInt('displayOrder', 0, 100000),
  ],
};
