/**
 * Shared API type definitions for the admin frontend.
 *
 * These are JSDoc typedefs describing the shapes returned by the backend so
 * services and hooks can rely on a consistent contract.
 */

/**
 * @typedef {Object} ApiResponseMeta
 * @property {string} timestamp - ISO timestamp of the response.
 * @property {string} [requestId] - Correlation id from the server.
 */

/**
 * Standard success envelope returned by every backend endpoint.
 * @template T
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Always true for success responses.
 * @property {number} statusCode - HTTP status code.
 * @property {string} message - Human-readable success message.
 * @property {T} data - Payload.
 * @property {ApiResponseMeta} meta - Response metadata.
 */

/**
 * A single field-level validation error.
 * @typedef {Object} ValidationError
 * @property {string} field - Name of the invalid field.
 * @property {string} message - Description of the violation.
 */

/**
 * Normalized error shape used across the admin application.
 * @typedef {Object} ApiError
 * @property {string} name - Fixed 'ApiError'.
 * @property {string} message - Human-readable error message.
 * @property {number} status - HTTP status code.
 * @property {string} code - Machine-readable error code.
 * @property {ValidationError[]} fieldErrors - Field-level validation errors.
 * @property {boolean} isNetworkError - True when the server was unreachable.
 * @property {boolean} isAuthError - True for 401/403 responses.
 */

/**
 * A group of keys used for optimistic updates in useResource.
 * @typedef {Object} ResourceKeys
 * @property {string} list - Cache key for the collection.
 * @property {(id: string) => string} item - Cache key for a single item.
 */

/**
 * Pagination metadata returned by list endpoints.
 * @typedef {Object} Pagination
 * @property {number} page - Current page (1-based).
 * @property {number} limit - Items per page.
 * @property {number} total - Total number of items.
 * @property {number} totalPages - Total number of pages.
 */

export {};
