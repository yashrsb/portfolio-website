import { body, param } from 'express-validator';
import {
  requiredString,
  optionalString,
  optionalUrl,
  optionalBoolean,
} from './common.js';

/**
 * Optional trimmed string array — validates non-empty string array if present.
 * @param {string} field - Body field name.
 * @param {string} [label] - Human-readable field label.
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
 * Validates a slug route parameter (lowercase, hyphen-separated).
 */
export const blogSlugValidator = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('A valid slug is required.')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage(
      'Slug must contain only lowercase letters, numbers, and hyphens.',
    ),
];

export const blogCategorySlugValidator = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('A valid category slug is required.')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Category slug must be lowercase with hyphens only.'),
];

export const blogTagSlugValidator = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('A valid tag slug is required.')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Tag slug must be lowercase with hyphens only.'),
];

/**
 * Validation rules for creating a blog post.
 */
export const blogPostValidators = {
  create: [
    ...requiredString('title', 200),
    ...requiredString('slug', 200),
    body('slug')
      .custom((value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value))
      .withMessage(
        'Slug must contain only lowercase letters, numbers, and hyphens.',
      ),
    ...optionalString('excerpt', 500),
    body('content').trim().notEmpty().withMessage('Content is required.'),
    body('status')
      .optional({ values: 'null' })
      .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
      .withMessage('Status must be DRAFT, PUBLISHED, or ARCHIVED.'),
    body('publishedAt')
      .optional({ values: 'null' })
      .isISO8601()
      .withMessage('Published date must be a valid ISO date.'),
    ...optionalUrl('coverImage', 'Cover image URL'),
    ...optionalUrl('canonicalUrl', 'Canonical URL'),
    ...optionalString('author', 160),
    ...optionalString('seoTitle', 200),
    ...optionalString('seoDescription', 500),
    ...optionalBoolean('featured'),
    ...optionalStringArray('tagIds', 'Tag IDs'),
    body('tagIds')
      .custom((arr) =>
        arr ? arr.every((v) => typeof v === 'string' && v.trim()) : true,
      )
      .withMessage('tagIds must be an array of non-empty strings.'),
    body('categoryId').optional({ values: 'null' }).isUUID(),
  ],

  update: [
    body('title')
      .optional({ values: 'null' })
      .trim()
      .notEmpty()
      .withMessage('Title must not be empty.')
      .isLength({ max: 200 })
      .withMessage('Title must be at most 200 characters.'),
    body('slug')
      .optional({ values: 'null' })
      .trim()
      .notEmpty()
      .withMessage('Slug must not be empty.')
      .isLength({ max: 200 })
      .withMessage('Slug must be at most 200 characters.')
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .withMessage(
        'Slug must contain only lowercase letters, numbers, and hyphens.',
      ),
    ...optionalString('excerpt', 500),
    body('content')
      .optional({ values: 'null' })
      .trim()
      .notEmpty()
      .withMessage('Content must not be empty.'),
    body('status')
      .optional({ values: 'null' })
      .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
      .withMessage('Status must be DRAFT, PUBLISHED, or ARCHIVED.'),
    body('publishedAt')
      .optional({ values: 'null' })
      .isISO8601()
      .withMessage('Published date must be a valid ISO date.'),
    ...optionalUrl('coverImage', 'Cover image URL'),
    ...optionalUrl('canonicalUrl', 'Canonical URL'),
    ...optionalString('author', 160),
    ...optionalString('seoTitle', 200),
    ...optionalString('seoDescription', 500),
    ...optionalBoolean('featured'),
    body('tagIds')
      .optional({ values: 'null' })
      .isArray()
      .withMessage('tagIds must be an array.')
      .custom((arr) => arr.every((v) => typeof v === 'string'))
      .withMessage('tagIds must contain only non-empty strings.'),
    body('categoryId').optional({ values: 'null' }).isUUID(),
  ],
};

/**
 * Validation rules for creating a blog category.
 */
export const blogCategoryValidators = {
  create: [
    ...requiredString('name', 120),
    body('slug')
      .trim()
      .notEmpty()
      .withMessage('Slug is required.')
      .isLength({ max: 200 })
      .withMessage('Slug must be at most 200 characters.')
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .withMessage(
        'Slug must contain only lowercase letters, numbers, and hyphens.',
      ),
    ...optionalString('description', 1000),
  ],

  update: [
    body('name')
      .optional({ values: 'null' })
      .trim()
      .notEmpty()
      .withMessage('Name must not be empty.')
      .isLength({ max: 120 })
      .withMessage('Name must be at most 120 characters.'),
    body('slug')
      .optional({ values: 'null' })
      .trim()
      .notEmpty()
      .withMessage('Slug must not be empty.')
      .isLength({ max: 200 })
      .withMessage('Slug must be at most 200 characters.')
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .withMessage(
        'Slug must contain only lowercase letters, numbers, and hyphens.',
      ),
    ...optionalString('description', 1000),
  ],
};

/**
 * Validation rules for creating a blog tag.
 */
export const blogTagValidators = {
  create: [
    ...requiredString('name', 80),
    body('slug')
      .trim()
      .notEmpty()
      .withMessage('Slug is required.')
      .isLength({ max: 200 })
      .withMessage('Slug must be at most 200 characters.')
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .withMessage(
        'Slug must contain only lowercase letters, numbers, and hyphens.',
      ),
  ],

  update: [
    body('name')
      .optional({ values: 'null' })
      .trim()
      .notEmpty()
      .withMessage('Name must not be empty.')
      .isLength({ max: 80 })
      .withMessage('Name must be at most 80 characters.'),
    body('slug')
      .optional({ values: 'null' })
      .trim()
      .notEmpty()
      .withMessage('Slug must not be empty.')
      .isLength({ max: 200 })
      .withMessage('Slug must be at most 200 characters.')
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .withMessage(
        'Slug must contain only lowercase letters, numbers, and hyphens.',
      ),
  ],
};

/**
 * Validates pagination query params (page, limit).
 */
export const blogPaginationValidator = [
  param('page')
    .optional({ values: 'null' })
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer.'),
  param('limit')
    .optional({ values: 'null' })
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50.'),
];
