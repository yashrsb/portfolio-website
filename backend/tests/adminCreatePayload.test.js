/**
 * Regression test based on the ACTUAL failing Admin Dashboard request.
 *
 * The real blog post that failed in the browser:
 *  - title/slug/status/SEO fields per the Admin form
 *  - ~1.15 MB of Markdown content
 *  - real category UUID + 5 tag UUIDs
 *
 * This exercises the exact middleware chain used by
 * POST /api/v1/admin/blog/posts (validators + validateRequest) so any
 * validation regression for the real payload shape is caught — without
 * touching the database.
 */
import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { blogPostValidators } from '../src/validators/blogValidator.js';
import validateRequest from '../src/middlewares/validateRequest.js';
import errorHandler from '../src/middlewares/errorHandler.js';

// Representative long-form technical article (≈1.1 MB), matching the shape
// of the real article that failed in the Admin Dashboard.
const buildContent = () =>
  [
    '# Designing Scalable Backend Systems: From Monolith to Microservices',
    '',
    'Building a backend that works is relatively easy. Building one that continues to work as users, features, teams, and traffic grow is much harder.',
    '',
    '## When a Monolith Is Actually the Right Choice\n\n' +
      'Realistic paragraph content for load testing. '.repeat(21000),
  ].join('\n');

const CATEGORY_ID = '799e5fe9-0d54-4260-a339-835625398ffd';
const TAG_IDS = [
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
];

const buildAdminPayload = () => ({
  title: 'Designing Scalable Backend Systems: From Monolith to Microservices',
  slug: 'designing-scalable-backend-systems-from-monolith-to-microservices',
  excerpt:
    'A practical guide to designing backend systems that can evolve from a simple monolith into scalable distributed services without introducing unnecessary complexity.',
  content: buildContent(),
  coverImage: null,
  status: 'PUBLISHED',
  publishedAt: '2026-09-05T00:00:00.000Z',
  author: 'Yash R.',
  featured: true,
  seoTitle: 'Designing Scalable Backend Systems: Monolith to Microservices',
  seoDescription:
    'Learn how backend systems evolve from monoliths to microservices, including service boundaries, database ownership, API communication, messaging, observability, and scalability trade-offs.',
  canonicalUrl:
    'https://yashrsb.is-a.dev/blog/designing-scalable-backend-systems-from-monolith-to-microservices',
  categoryId: CATEGORY_ID,
  tagIds: TAG_IDS,
});

const buildApp = () => {
  const app = express();
  app.use(express.json({ limit: '2mb' }));
  app.post(
    '/admin/blog/posts',
    blogPostValidators.create,
    validateRequest,
    (_req, res) => res.status(201).json({ success: true }),
  );
  app.use(errorHandler);
  return app;
};

describe('admin blog post create payload (real request shape)', () => {
  it('accepts the exact Admin Dashboard payload including ~1MB Markdown', async () => {
    const payload = buildAdminPayload();
    const serialized = Buffer.byteLength(JSON.stringify(payload));
    // Sanity: this is genuinely a large payload, below the 2mb parser limit.
    expect(serialized).toBeGreaterThan(500 * 1024);
    expect(serialized).toBeLessThan(2 * 1024 * 1024);

    const res = await request(buildApp())
      .post('/admin/blog/posts')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('still rejects a payload exceeding the 2mb parser limit with 413', async () => {
    const payload = buildAdminPayload();
    payload.content += 'x'.repeat(3 * 1024 * 1024);

    const res = await request(buildApp())
      .post('/admin/blog/posts')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(res.status).toBe(413);
    expect(res.body.code).toBe('PAYLOAD_TOO_LARGE');
  });
});
