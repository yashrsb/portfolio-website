import axios from 'axios';
import { getAccessToken, setAccessToken, clearSession } from '../tokenStore';
import { normalizeApiError } from '../../utils/apiErrors';

/** Base URL of the backend API. */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

/** Requests that should never be replayed after a token refresh. */
const NON_RETRYABLE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Single-flight refresh promise. Prevents concurrent /auth/refresh calls.
 * @type {Promise<string>|null}
 */
let refreshPromise = null;

/**
 * Requests that arrived while a refresh was in flight.
 * @type {Array<{resolve: Function}>}
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
      `${API_BASE_URL}/auth/refresh`,
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
 * - transparently refreshes an expired token, retries once, then logs out
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the current access token to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration by refreshing once, replaying the original request.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 401;
    const isRefreshCall = originalRequest?.url?.includes('/auth/refresh');

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
        if (NON_RETRYABLE_METHODS.has(originalRequest.method?.toUpperCase())) {
          redirectToLogin();
        }
        return Promise.reject(refreshError);
      }
    }

    if (isUnauthorized && !getAccessToken()) {
      redirectToLogin();
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export default apiClient;
