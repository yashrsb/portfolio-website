import { body } from 'express-validator';

/**
 * Validates a reorder request body of the form:
 * { "items": [{ "id": "...", "displayOrder": 1 }, ...] }
 */
/**
 * Rejects reorder payloads containing duplicate item ids.
 * @param {Array<{id: string, displayOrder: number}>} items - Reorder items.
 * @returns {boolean} True when every id is unique.
 */
const hasUniqueIds = (items) => {
  if (!Array.isArray(items)) return true;
  const ids = items.map((item) => item && item.id);
  return new Set(ids).size === ids.length;
};

export const reorderValidator = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('items must be a non-empty array.'),
  body('items.*.id')
    .isUUID()
    .withMessage('Each item must include a valid id (UUID).'),
  body('items.*.displayOrder')
    .isInt({ min: 0, max: 100000 })
    .withMessage(
      'Each item must include a displayOrder integer between 0 and 100000.',
    ),
  body('items')
    .custom(hasUniqueIds)
    .withMessage('items must not contain duplicate ids.'),
];
