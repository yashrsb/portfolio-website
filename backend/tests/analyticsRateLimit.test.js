import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import analyticsRateLimiter from '../src/config/analyticsRateLimit.js';
import requestId from '../src/middlewares/requestId.js';
import { HTTP_STATUS } from '../src/constants/httpStatus.js';
import { ERROR_CODES } from '../src/constants/errorCodes.js';

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(requestId);
  app.post('/events', analyticsRateLimiter, (req, res) => {
    res.status(HTTP_STATUS.ACCEPTED).json({ success: true });
  });
  return app;
};

describe('analyticsRateLimiter', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  it('allows requests under the configured limit', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app).post('/events').send({
        eventType: 'PAGE_VIEW',
        path: '/',
      });
      expect(res.status).toBe(HTTP_STATUS.ACCEPTED);
    }
  });

  it('returns 429 when the limit is exceeded', async () => {
    // The limit is 60 per minute; we already sent 5 above.
    // Send more to hit the limit.
    let lastRes;
    for (let i = 0; i < 60; i++) {
      lastRes = await request(app).post('/events').send({
        eventType: 'PAGE_VIEW',
        path: '/',
      });
    }
    expect(lastRes.status).toBe(HTTP_STATUS.TOO_MANY_REQUESTS);
    expect(lastRes.body.success).toBe(false);
    expect(lastRes.body.code).toBe(ERROR_CODES.RATE_LIMIT_EXCEEDED);
    expect(lastRes.body.message).toContain('Too many analytics');
  });

  it('returns 429 with a structured error envelope', async () => {
    const res = await request(app).post('/events').send({
      eventType: 'PAGE_VIEW',
      path: '/',
    });
    expect(res.status).toBe(HTTP_STATUS.TOO_MANY_REQUESTS);
    expect(res.body.meta).toHaveProperty('timestamp');
    expect(res.body.meta).toHaveProperty('requestId');
  });
});
