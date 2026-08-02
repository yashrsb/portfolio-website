/**
 * Wraps an async route handler so rejected promises are
 * forwarded to the centralized error middleware.
 * @param {Function} handler - Async Express handler.
 * @returns {Function} Wrapped handler.
 */
const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export default asyncHandler;
