import {
  requiredString,
  optionalString,
  optionalUrl,
  optionalInt,
} from './common.js';

/**
 * Validation rules for creating and updating a certificate.
 */
export const certificateValidators = {
  create: [
    ...requiredString('name', 160),
    ...requiredString('issuer', 160),
    ...requiredString('year', 10),
    ...optionalUrl('url', 'Certificate URL'),
  ],
  update: [
    ...optionalString('name', 160),
    ...optionalString('issuer', 160),
    ...optionalString('year', 10),
    ...optionalUrl('url', 'Certificate URL'),
    ...optionalInt('displayOrder', 0, 100000),
  ],
};
