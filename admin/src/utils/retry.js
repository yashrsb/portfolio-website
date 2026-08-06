/**
 * Retry strategy for the API client.
 *
 * - Only GET requests are retried automatically.
 * - Uses exponential backoff with jitter.
 * - Never retries POST/PUT/PATCH/DELETE.
 * - Retries only network errors and 5xx / 408 / 425 / 429 responses.
 */
import { RETRY } from '../constants/api';

/**
 * Checks whether a request method is eligible for automatic retry.
 * @param {string} method - The HTTP method (e.g. 'GET').
 * @returns {boolean} True if retryable.
 */
export const isRetryableMethod = (method) => {
  const normalized = (method || '').toUpperCase();
  return normalized === 'GET';
};

/**
 * Checks whether an error is eligible for retry.
 * @param {import('axios').AxiosError} error - The axios error.
 * @returns {boolean} True if retryable.
 */
export const isRetryableError = (error) => {
  // Network errors (no response) are retryable.
  if (!error.response) {
    return true;
  }
  return RETRY.retryableStatuses.has(error.response.status);
};

/**
 * Computes the exponential backoff delay for a given attempt.
 * Includes a small random jitter to avoid a thundering herd.
 * @param {number} attempt - The retry attempt (0-based).
 * @returns {number} Delay in milliseconds.
 */
export const getBackoffDelay = (attempt) => {
  const exponential = RETRY.baseDelay * 2 ** attempt;
  const capped = Math.min(exponential, RETRY.maxDelay);
  const jitter = Math.random() * 0.3 + 0.85; // 0.85–1.15x
  return Math.floor(capped * jitter);
};

/**
 * Sleep helper.
 * @param {number} ms - Milliseconds to wait.
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default { isRetryableMethod, isRetryableError, getBackoffDelay, sleep };
