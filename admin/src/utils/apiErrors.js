/**
 * Error normalization utilities.
 *
 * Converts an axios error (or any thrown value) into a consistent ApiError
 * shape consumed by hooks, banners, and toasts. The backend returns:
 *   { success:false, message, code, errors:[{field,message}], meta }
 * and express-validator field errors are mapped to `fieldErrors`.
 */

/**
 * Extracts a human-readable message from an axios error.
 * @param {import('axios').AxiosError} error - The axios error.
 * @returns {string} A readable message.
 */
const extractMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Please try again.';
  }
  if (error.request) {
    return 'Unable to reach the server. Check your connection and try again.';
  }
  return error.message || 'An unexpected error occurred.';
};

/**
 * Maps backend `errors` (express-validator shape) plus a `code` field into a
 * normalized `fieldErrors` array. Falls back to a synthetic field error when a
 * code like VALIDATION_ERROR exists without detailed field errors.
 * @param {object} data - The backend error payload.
 * @returns {Array<import('../services/types.js').ValidationError>} Field errors.
 */
const extractFieldErrors = (data) => {
  if (Array.isArray(data?.errors)) {
    return data.errors
      .map((err) => ({
        field: err.field ?? err.path ?? 'form',
        message: err.message ?? 'Invalid value.',
      }))
      .filter((err) => err.field && err.message);
  }
  if (data?.code === 'VALIDATION_ERROR') {
    return [{ field: 'form', message: data.message || 'Validation failed.' }];
  }
  return [];
};

/**
 * Normalizes any thrown value into an ApiError.
 * @param {unknown} error - The caught error (often an axios error).
 * @returns {import('../services/types.js').ApiError} Normalized error.
 */
export const normalizeApiError = (error) => {
  const status = error?.response?.status || 0;
  const data = error?.response?.data || {};

  return {
    name: 'ApiError',
    message: extractMessage(error),
    status,
    code: data.code || error?.code || 'UNKNOWN_ERROR',
    fieldErrors: extractFieldErrors(data),
    isNetworkError: !error?.response,
    isAuthError: status === 401 || status === 403,
  };
};

/**
 * Convenience wrapper for try/catch blocks that always returns a normalized
 * ApiError instead of throwing.
 * @param {Promise<T>} promise - The promise to await.
 * @returns {Promise<{data: T|null, error: import('../services/types.js').ApiError|null}>} Result tuple.
 * @template T
 */
export const toResult = async (promise) => {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: normalizeApiError(error) };
  }
};

export default { normalizeApiError, toResult };
