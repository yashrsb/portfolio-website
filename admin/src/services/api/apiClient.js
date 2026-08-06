import axios from 'axios';
import { getAccessToken, setAccessToken, clearSession } from '../tokenStore';
import { normalizeApiError } from '../../utils/apiErrors';
import {
  API_BASE_URL,
  REQUEST_TIMEOUT,
  RETRY,
  AUTH_ENDPOINTS,
} from '../../constants/api';
import {
  isRetryableMethod,
  isRetryableError,
  getBackoffDelay,
  sleep,
} from '../../utils/retry';

/**
 * Single-flight refresh promise. Prevents concurrent /auth/refresh calls.
 * @type {Promise<string>|null}
 */
let refreshPromise = null;

/**
 * Requests that arrived while a refresh was in flight.
 * @type {Array<{resolve: Function, reject: Function}>}
 */
let pendingQueue = [];

/**
 * Resolves all queued requests after a successful refresh.
 * @param {string} token - The fresh access token.
 */
const flushQueue = (token) => {
  pendingQueue.forEach(({ resolve }) => resolve(token));
  pendingQueue = [];
};

/**
 * Rejects all queued requests when a refresh fails.
 * @param {Error} error - The refresh error.
 */
const rejectQueue = (error) => {
  pendingQueue.forEach(({ reject }) => reject(error));
  pendingQueue = [];
};

/**
 * Attempts to obtain a fresh access token via the refresh cookie.
 * Only one refresh request runs at a time; concurrent callers await it.
 * @returns {Promise<string>} The fresh access token.
 */
const refreshAccessToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = new Promise((resolve, reject) => {
    pendingQueue.push({ resolve, reject });
  });

  try {
    // The refresh token lives in an httpOnly cookie, so credentials are
    // required. The server rotates it and sets a new cookie automatically.
    const response = await axios.post(
      `${API_BASE_URL}${AUTH_ENDPOINTS.refresh}`,
      {},
      { withCredentials: true },
    );
    const token = response.data?.data?.accessToken;
    if (!token) {
      throw new Error('Refresh response did not include an access token.');
    }
    setAccessToken(token);
    flushQueue(token);
    return token;
  } catch (error) {
    clearSession();
    rejectQueue(error);
    throw error;
  } finally {
    refreshPromise = null;
  }
};

/**
 * Redirects the browser to the login page, preserving the current location
 * so the user can be returned after re-authentication.
 */
const redirectToLogin = () => {
  const currentPath =
    window.location.pathname + window.location.search + window.location.hash;
  window.location.assign(`/login?redirect=${encodeURIComponent(currentPath)}`);
};

/**
 * Configured axios instance for the admin application.
 * - points at the backend API
 * - includes credentials (refresh cookie)
 * - enforces a request timeout
 * - attaches the access token on every request
 * - transparently refreshes an expired token, retries GETs, then logs out
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the current access token to every outgoing request.
// Also record the original method so the retry interceptor can decide.
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config._originalMethod = (config.method || 'GET').toUpperCase();
  return config;
});

// Handle token expiration by refreshing once, replaying the original request.
// Also implement exponential-backoff retry for idempotent GET requests.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const method = (originalRequest?._originalMethod || 'GET').toUpperCase();
    const isUnauthorized = error.response?.status === 401;
    const isRefreshCall = originalRequest?.url?.includes(
      AUTH_ENDPOINTS.refresh,
    );

    // --- Token refresh flow ---
    if (
      isUnauthorized &&
      !originalRequest._retried &&
      !isRefreshCall &&
      getAccessToken()
    ) {
      originalRequest._retried = true;
      try {
        const token = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        if (RETRY.nonRetryableMethods.has(method)) {
          redirectToLogin();
        }
        return Promise.reject(refreshError);
      }
    }

    if (isUnauthorized && !getAccessToken()) {
      redirectToLogin();
    }

    // --- Retry flow (GET only, network/5xx errors, exponential backoff) ---
    const attempt = originalRequest?._retryCount || 0;
    if (
      isRetryableMethod(method) &&
      isRetryableError(error) &&
      attempt < RETRY.maxAttempts
    ) {
      originalRequest._retryCount = attempt + 1;
      const delay = getBackoffDelay(attempt);
      await sleep(delay);
      return apiClient(originalRequest);
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export default apiClient;
