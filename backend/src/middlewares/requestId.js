import { randomUUID } from 'node:crypto';

/**
 * Assigns a unique request ID to every incoming request.
 * Respects an existing X-Request-ID header if provided.
 */
const requestId = (req, res, next) => {
  const providedId = req.get('X-Request-ID');
  req.id = providedId || randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
};

export default requestId;
