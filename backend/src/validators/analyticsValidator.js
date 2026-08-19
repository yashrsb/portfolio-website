import { body, query } from 'express-validator';

/**
 * Analytics event validation rules.
 *
 * Validates the public analytics ingestion endpoint (POST /api/v1/analytics/events).
 * Only the fields that are safe to accept from the client are validated.
 * Country, device, browser, visitor hash, and referrer are derived
 * server-side from the request — the client cannot set them.
 */

const VALID_EVENT_TYPES = [
  'PAGE_VIEW',
  'PROJECT_VIEW',
  'PROJECT_CLICK',
  'BLOG_POST_VIEW',
];

const pathValidator = body('path')
  .trim()
  .notEmpty()
  .withMessage('Path is required.')
  .isLength({ max: 500 })
  .withMessage('Path must be at most 500 characters.')
  .matches(/^\/[a-zA-Z0-9\-._~%/]*/)
  .withMessage('Path must start with "/".');

const projectSlugValidator = body('projectSlug')
  .optional({ values: 'null' })
  .trim()
  .isLength({ min: 1, max: 200 })
  .withMessage('Project slug must be between 1 and 200 characters.')
  .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .withMessage('Project slug must be lowercase with hyphens only.');

const blogPostSlugValidator = body('blogPostSlug')
  .optional({ values: 'null' })
  .trim()
  .isLength({ min: 1, max: 200 })
  .withMessage('Blog post slug must be between 1 and 200 characters.')
  .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .withMessage('Blog post slug must be lowercase with hyphens only.');

const metadataValidator = body('metadata')
  .optional({ values: 'null' })
  .isObject()
  .withMessage('Metadata must be an object.')
  .custom((value) => {
    const keys = Object.keys(value);
    if (keys.length > 10) {
      throw new Error('Metadata must not exceed 10 keys.');
    }
    for (const key of keys) {
      if (typeof key !== 'string' || key.length > 50) {
        throw new Error('Metadata keys must be strings of at most 50 chars.');
      }
      const v = value[key];
      if (
        typeof v !== 'string' &&
        typeof v !== 'number' &&
        typeof v !== 'boolean'
      ) {
        throw new Error(
          `Metadata value for "${key}" must be a string, number, or boolean.`,
        );
      }
      if (typeof v === 'string' && v.length > 200) {
        throw new Error(`Metadata value for "${key}" exceeds 200 characters.`);
      }
    }
    return true;
  });

/**
 * Custom validation: ensures projectSlug is provided
 * when eventType is PROJECT_VIEW or PROJECT_CLICK.
 */
const requireProjectSlugIfRelevant = body('projectSlug').custom(
  (value, { req }) => {
    if (
      (req.body.eventType === 'PROJECT_VIEW' ||
        req.body.eventType === 'PROJECT_CLICK') &&
      (!value || typeof value !== 'string' || value.trim() === '')
    ) {
      throw new Error(
        'projectSlug is required for PROJECT_VIEW and PROJECT_CLICK events.',
      );
    }
    return true;
  },
);

/**
 * Custom validation: ensures blogPostSlug is provided
 * when eventType is BLOG_POST_VIEW.
 */
const requireBlogPostSlugIfRelevant = body('blogPostSlug').custom(
  (value, { req }) => {
    if (
      req.body.eventType === 'BLOG_POST_VIEW' &&
      (!value || typeof value !== 'string' || value.trim() === '')
    ) {
      throw new Error('blogPostSlug is required for BLOG_POST_VIEW events.');
    }
    return true;
  },
);

/**
 * Validates the analytics event payload for POST /api/v1/analytics/events.
 */
export const analyticsEventValidators = [
  body('eventType')
    .trim()
    .notEmpty()
    .withMessage('Event type is required.')
    .isIn(VALID_EVENT_TYPES)
    .withMessage(`Event type must be one of: ${VALID_EVENT_TYPES.join(', ')}.`),
  pathValidator,
  projectSlugValidator,
  blogPostSlugValidator,
  metadataValidator,
  requireProjectSlugIfRelevant,
  requireBlogPostSlugIfRelevant,
];

/**
 * Validates query params for analytics aggregation endpoints.
 * Accepts: days (1-365), limit (1-100).
 */
export const analyticsQueryValidators = [
  query('days')
    .optional({ values: 'null' })
    .isInt({ min: 1, max: 365 })
    .withMessage('days must be an integer between 1 and 365.'),
  query('limit')
    .optional({ values: 'null' })
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100.'),
];

export { VALID_EVENT_TYPES };
