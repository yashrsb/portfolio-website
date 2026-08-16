import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { contactRateLimiter } from '../src/config/index.js';
import requestId from '../src/middlewares/requestId.js';
import { HTTP_STATUS } from '../src/constants/httpStatus.js';
import { ERROR_CODES } from '../src/constants/errorCodes.js';

/**
 * Creates a minimal Express app with the contact rate limiter applied
 * to a single test endpoint. Includes requestId middleware for meta.
 */
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(requestId);
  app.post('/test-contact', contactRateLimiter, (req, res) => {
    res.status(HTTP_STATUS.ACCEPTED).json({ success: true });
  });
  return app;
};

describe('contactRateLimiter', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  it('allows requests under the configured limit', async () => {
    for (let i = 0; i < 3; i++) {
      const res = await request(app).post('/test-contact').send({
        name: 'Test',
      });
      expect(res.status).toBe(HTTP_STATUS.ACCEPTED);
    }
  });

  it('returns 429 when the limit is exceeded', async () => {
    const res = await request(app).post('/test-contact').send({
      name: 'Test',
    });
    expect(res.status).toBe(HTTP_STATUS.TOO_MANY_REQUESTS);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe(ERROR_CODES.RATE_LIMIT_EXCEEDED);
    expect(res.body.message).toContain('Too many messages');
  });

  it('returns 429 with a structured error envelope', async () => {
    const res = await request(app).post('/test-contact').send({
      name: 'Test',
    });
    expect(res.status).toBe(HTTP_STATUS.TOO_MANY_REQUESTS);
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toHaveProperty('requestId');
    expect(res.body.meta).toHaveProperty('timestamp');
  });
});
