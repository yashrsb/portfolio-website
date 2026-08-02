/**
 * Shared validation helpers for admin forms.
 */

/**
 * Returns true when the value is empty (null, undefined, or whitespace-only).
 *
 * @param {string | undefined | null} value
 * @returns {boolean}
 */
export const isRequired = (value) =>
  value === undefined || value === null || String(value).trim() === '';

/**
 * Returns true when the value is a plausible URL.
 *
 * @param {string | undefined | null} value
 * @returns {boolean}
 */
export const isUrl = (value) => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validates an email address using a pragmatic regex.
 *
 * @param {string} value
 * @returns {boolean}
 */
export const isEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

/**
 * Clamps a numeric string to a valid percentage range.
 *
 * @param {string | number} value
 * @returns {boolean}
 */
export const isValidPercentage = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 && num <= 100;
};
