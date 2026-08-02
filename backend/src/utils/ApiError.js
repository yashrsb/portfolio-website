/**
 * Custom error class for API errors.
 * Carries an HTTP status code, a structured error code,
 * and an optional list of field-level errors.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code.
   * @param {string} message - Human-readable error message.
   * @param {string} [code] - Machine-readable error code.
   * @param {Array} [errors] - Field-level validation errors.
   */
  constructor(
    statusCode,
    message,
    code = 'INTERNAL_SERVER_ERROR',
    errors = [],
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = true;
  }
}

export default ApiError;
