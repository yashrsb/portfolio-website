/**
 * Middleware to set cache-control headers on public API responses.
 * Caches GET responses for a short period to reduce server load.
 *
 * Usage: router.get('/profile', cacheHeaders({ maxAge: 300 }), handler);
 *
 * @param {object} [options]
 * @param {number} [options.maxAge=300] - Cache time in seconds
 */
const cacheHeaders = (options = {}) => {
  const maxAge = options.maxAge || 300; // 5 minutes default

  return (req, res, next) => {
    if (req.method === 'GET' && res.statusCode < 400) {
      res.set(
        'Cache-Control',
        `public, max-age=${maxAge}, stale-while-revalidate=60`,
      );
    }
    next();
  };
};

export default cacheHeaders;
