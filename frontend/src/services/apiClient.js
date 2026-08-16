/**
 * Reusable API client with timeout, AbortController support,
 * automatic JSON parsing, error normalization, and GET retry.
 */

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';
const DEFAULT_TIMEOUT = 10_000; // 10 seconds
const MAX_RETRIES = 2;

/**
 * Normalized API error with a user-friendly message.
 */
export class ApiError extends Error {
  /**
   * @param {number} status - HTTP status code
   * @param {string} message - Human-readable error
   * @param {*} [details] - Optional server-provided details
   */
  constructor(status, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Sleep helper for retry backoff.
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Core fetch wrapper.
 *
 * @param {string} endpoint - Path relative to BASE_URL (e.g. "/projects")
 * @param {object} [options]
 * @param {object} [options.params] - URL search params
 * @param {AbortSignal} [options.signal] - AbortController signal
 * @param {number} [options.timeout] - Request timeout in ms
 * @param {string} [options.method] - HTTP method (default: "GET")
 * @param {object} [options.body] - Request body (for POST/PUT/PATCH)
 * @param {object} [options.headers] - Additional headers
 * @returns {Promise<*>} Parsed JSON response data
 */
async function request(endpoint, options = {}) {
  const {
    params,
    signal: externalSignal,
    timeout = DEFAULT_TIMEOUT,
    method = 'GET',
    body,
    headers: extraHeaders,
  } = options;

  // Build URL with query params
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  // AbortController for timeout
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), timeout);

  // Merge external signal if provided
  const signal = externalSignal
    ? combineSignals(externalSignal, abortController.signal)
    : abortController.signal;

  /** @type {RequestInit} */
  const fetchOptions = {
    method,
    signal,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...extraHeaders,
    },
  };

  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url.toString(), fetchOptions);
    clearTimeout(timeoutId);

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    let data;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data?.message || `Request failed with status ${response.status}`,
        data,
      );
    }

    // Unwrap standard envelope: { success, message, data, meta }
    if (
      data &&
      typeof data === 'object' &&
      'success' in data &&
      'data' in data
    ) {
      return data.data;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new ApiError(0, 'Request timed out');
    }

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new ApiError(0, 'Network error — unable to reach the server');
    }

    throw new ApiError(0, error.message || 'An unexpected error occurred');
  }
}

/**
 * GET request with automatic retry (max 2 retries, exponential backoff).
 *
 * @param {string} endpoint - API endpoint path
 * @param {object} [options] - Same as request() options
 * @returns {Promise<*>}
 */
async function getWithRetry(endpoint, options = {}) {
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await request(endpoint, { ...options, method: 'GET' });
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES) {
        // Don't retry 4xx client errors
        if (
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          throw error;
        }
        await sleep(Math.pow(2, attempt) * 200); // 200ms, 400ms
      }
    }
  }

  throw lastError;
}

/**
 * Combine two AbortSignals into one.
 * @param {AbortSignal} s1
 * @param {AbortSignal} s2
 * @returns {AbortSignal}
 */
function combineSignals(s1, s2) {
  const controller = new AbortController();

  const onAbort = () => controller.abort();
  s1.addEventListener('abort', onAbort);
  s2.addEventListener('abort', onAbort);

  if (s1.aborted || s2.aborted) {
    controller.abort();
  }

  return controller.signal;
}

/**
 * Convenience exports.
 */
export const apiClient = {
  get: (endpoint, options) => getWithRetry(endpoint, options),
  post: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options) =>
    request(endpoint, { ...options, method: 'DELETE' }),
};
