import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { analyticsEventValidators } from '../src/validators/analyticsValidator.js';
import validateRequest from '../src/middlewares/validateRequest.js';
import { ERROR_CODES } from '../src/constants/errorCodes.js';

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.post(
    '/test',
    analyticsEventValidators,
    validateRequest,
    (req, res) => {
      res.status(200).json({ body: req.body });
    },
  );

  // Error handler — needed so ApiError responses include `code`
  app.use((err, _req, res, _next) => {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
      code: err.code,
      errors: err.errors || [],
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'test-req-id',
      },
    });
  });

  return app;
};

describe('analyticsEventValidators', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  it('accepts a valid PAGE_VIEW event', async () => {
    const res = await request(app).post('/test').send({
      eventType: 'PAGE_VIEW',
      path: '/projects',
    });
    expect(res.status).toBe(200);
    expect(res.body.body.eventType).toBe('PAGE_VIEW');
  });

  it('accepts a valid PROJECT_VIEW event with projectSlug', async () => {
    const res = await request(app).post('/test').send({
      eventType: 'PROJECT_VIEW',
      path: '/projects/notifyhub',
      projectSlug: 'notifyhub',
    });
    expect(res.status).toBe(200);
  });

  it('accepts a valid PROJECT_CLICK event with projectSlug and metadata', async () => {
    const res = await request(app).post('/test').send({
      eventType: 'PROJECT_CLICK',
      path: '/projects/notifyhub',
      projectSlug: 'notifyhub',
      metadata: { destination: 'github' },
    });
    expect(res.status).toBe(200);
    expect(res.body.body.metadata).toEqual({ destination: 'github' });
  });

  it('accepts a valid BLOG_POST_VIEW event with blogPostSlug', async () => {
    const res = await request(app).post('/test').send({
      eventType: 'BLOG_POST_VIEW',
      path: '/blog/my-post',
      blogPostSlug: 'my-post',
    });
    expect(res.status).toBe(200);
  });

  it('rejects an invalid event type', async () => {
    const res = await request(app).post('/test').send({
      eventType: 'UNKNOWN_EVENT',
      path: '/projects',
    });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  it('rejects a path that does not start with /', async () => {
    const res = await request(app).post('/test').send({
      eventType: 'PAGE_VIEW',
      path: 'projects',
    });
    expect(res.status).toBe(400);
  });

  it('rejects an empty path', async () => {
    const res = await request(app).post('/test').send({
      eventType: 'PAGE_VIEW',
      path: '',
    });
    expect(res.status).toBe(400);
  });

  it('rejects a missing eventType', async () => {
    const res = await request(app).post('/test').send({
      path: '/projects',
    });
    expect(res.status).toBe(400);
  });

  it('rejects PROJECT_VIEW without projectSlug', async () => {
    const res = await request(app).post('/test').send({
      eventType: 'PROJECT_VIEW',
      path: '/projects/notifyhub',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('rejects BLOG_POST_VIEW without blogPostSlug', async () => {
    const res = await request(app).post('/test').send({
      eventType: 'BLOG_POST_VIEW',
      path: '/blog/my-post',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('accepts a PAGE_VIEW without projectSlug or blogPostSlug', async () => {
    const res = await request(app).post('/test').send({
      eventType: 'PAGE_VIEW',
      path: '/',
    });
    expect(res.status).toBe(200);
  });

  it('rejects an oversized metadata payload (>10 keys)', async () => {
    const metadata = {};
    for (let i = 0; i < 11; i++) {
      metadata[`key${i}`] = 'value';
    }
    const res = await request(app).post('/test').send({
      eventType: 'PAGE_VIEW',
      path: '/',
      metadata,
    });
    expect(res.status).toBe(400);
  });

  it('rejects metadata with a non-object value', async () => {
    const res = await request(app).post('/test').send({
      eventType: 'PAGE_VIEW',
      path: '/',
      metadata: 'not-an-object',
    });
    expect(res.status).toBe(400);
  });

  it('rejects metadata with oversized string values (>200 chars)', async () => {
    const res = await request(app).post('/test').send({
      eventType: 'PAGE_VIEW',
      path: '/',
      metadata: { long: 'x'.repeat(201) },
    });
    expect(res.status).toBe(400);
  });

  it('accepts metadata with valid keys and values', async () => {
    const res = await request(app).post('/test').send({
      eventType: 'PAGE_VIEW',
      path: '/',
      metadata: { ref: 'home', source: 'nav', count: 3, active: true },
    });
    expect(res.status).toBe(200);
  });

  it('rejects a path exceeding 500 characters', async () => {
    const res = await request(app).post('/test').send({
      eventType: 'PAGE_VIEW',
      path: '/' + "a".repeat(500),
    });
    expect(res.status).toBe(400);
  });
});
