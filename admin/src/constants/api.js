/**
 * Central API constants for the admin application.
 *
 * All endpoints, HTTP methods, timeouts, retry/cache settings, and cookie
 * names live here so they are never hardcoded across the codebase.
 */

/** Base URL of the backend API. */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';

/** HTTP methods. */
export const HTTP_METHODS = Object.freeze({
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  PATCH: 'patch',
  DELETE: 'delete',
});

/** Request timeout (ms). */
export const REQUEST_TIMEOUT = 15000;

/** Retry settings. */
export const RETRY = Object.freeze({
  /** Maximum number of automatic retries for GET requests. */
  maxAttempts: 3,
  /** Base delay for exponential backoff (ms). */
  baseDelay: 300,
  /** Max delay cap for exponential backoff (ms). */
  maxDelay: 5000,
  /** Methods that are never automatically retried. */
  nonRetryableMethods: new Set([
    HTTP_METHODS.POST,
    HTTP_METHODS.PUT,
    HTTP_METHODS.PATCH,
    HTTP_METHODS.DELETE,
  ]),
  /** HTTP status codes eligible for retry (network + server errors). */
  retryableStatuses: new Set([408, 425, 429, 500, 502, 503, 504]),
});

/** Cache settings for the resource cache. */
export const CACHE = Object.freeze({
  /** Default time-to-live (ms). */
  ttl: 30000,
  /** Maximum number of entries to keep in the cache. */
  maxEntries: 200,
  /** Whether background refetch is enabled by default. */
  backgroundRefetch: true,
});

/** Cookie names. */
export const COOKIE_NAMES = Object.freeze({
  refreshToken: 'refreshToken',
});

/** Auth endpoints. */
export const AUTH_ENDPOINTS = Object.freeze({
  login: '/auth/login',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  me: '/auth/me',
});

/** Admin resource endpoints keyed by resource name. */
export const ADMIN_ENDPOINTS = Object.freeze({
  projects: '/admin/projects',
  skills: '/admin/skills',
  experience: '/admin/experience',
  education: '/admin/education',
  'social-links': '/admin/social-links',
  resume: '/admin/resume',
  stats: '/admin/stats',
  profile: '/admin/profile',
  'contact-messages': '/admin/contact-messages',
  analytics: {
    overview: '/admin/analytics/overview',
    timeseries: '/admin/analytics/timeseries',
    pages: '/admin/analytics/pages',
    countries: '/admin/analytics/countries',
    devices: '/admin/analytics/devices',
    browsers: '/admin/analytics/browsers',
    projects: '/admin/analytics/projects',
    referrers: '/admin/analytics/referrers',
  },
});

export default {
  API_BASE_URL,
  HTTP_METHODS,
  REQUEST_TIMEOUT,
  RETRY,
  CACHE,
  COOKIE_NAMES,
  AUTH_ENDPOINTS,
  ADMIN_ENDPOINTS,
};
