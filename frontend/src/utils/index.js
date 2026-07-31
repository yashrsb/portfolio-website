/**
 * Utility functions for the portfolio.
 * Pure helper functions only — no side effects.
 */

/**
 * Format a date string to a human-readable format.
 * @param {string | Date} date - Date to format
 * @param {Intl.DateTimeFormatOptions} [options] - Formatting options
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  return new Date(date).toLocaleDateString('en-US', defaultOptions);
}

/**
 * Join multiple class names, filtering out falsy values.
 * @param {...(string | false | null | undefined)} classes
 * @returns {string}
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Clamp a number between min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export { animateValue, getTypedText } from './animation';
