// Debug repro: run the REAL create validators against the EXACT payload
// the Admin form builds for the failing article.
import express from 'express';
import { blogPostValidators } from '../../src/validators/blogValidator.js';
import validateRequest from '../../src/middlewares/validateRequest.js';

const content = [
  '# Designing Scalable Backend Systems: From Monolith to Microservices',
  '',
  'Building a backend that works is relatively easy. '.repeat(30000),
].join('\n');

const payload = {
  title: 'Designing Scalable Backend Systems: From Monolith to Microservices',
  slug: 'designing-scalable-backend-systems-from-monolith-to-microservices',
  excerpt:
    'A practical guide to designing backend systems that can evolve from a simple monolith into scalable distributed services without introducing unnecessary complexity.',
  content,
  coverImage: null,
  status: 'PUBLISHED',
  publishedAt: new Date('2026-09-05T00:00:00.000Z').toISOString(),
  author: 'Yash R.',
  featured: true,
  seoTitle: 'Designing Scalable Backend Systems: Monolith to Microservices',
  seoDescription:
    'Learn how backend systems evolve from monoliths to microservices, including service boundaries, database ownership, API communication, messaging, observability, and scalability trade-offs.',
  canonicalUrl:
    'https://yashrsb.is-a.dev/blog/designing-scalable-backend-systems-from-monolith-to-microservices',
  categoryId: '550e8400-e29b-41d4-a716-446655440000',
  tagIds: [
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440005',
  ],
};

console.log('content length:', content.length);
console.log('serialized body bytes:', Buffer.byteLength(JSON.stringify(payload)));

const app = express();
app.use(express.json({ limit: '2mb' }));
app.post('/repro', blogPostValidators.create, validateRequest, (req, res) => {
  res.json({ ok: true });
});
app.use((err, _req, res, _next) => {
  res.status(err.status || 500).json({ error: err.message, type: err.type });
});

const server = app.listen(0, async () => {
  const port = server.address().port;
  const res = await fetch(`http://127.0.0.1:${port}/repro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  console.log('status:', res.status);
  console.log('body:', JSON.stringify(body, null, 2));
  server.close();
});
