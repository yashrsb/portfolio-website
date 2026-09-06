// End-to-end repro against the LIVE local backend (localhost:5001).
// Uses the exact article from the failing Admin Dashboard request.
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const axios = require('D:/Desktop/Repositories/portfolio/admin/node_modules/axios/dist/node/axios.cjs');

const BASE = 'http://localhost:5001/api/v1';
const env = fs.readFileSync(new URL('../../.env', import.meta.url), 'utf8');
const pw = env.match(/^ADMIN_PASSWORD=(.*)$/m)[1].trim();

const login = await fetch(`${BASE}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@portfolio.com', password: pw }),
}).then((r) => r.json());
const token = login?.data?.accessToken;
if (!token) throw new Error('login failed');
const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

const cats = await fetch(`${BASE}/admin/blog/categories`, { headers: auth }).then((r) => r.json());
const tags = await fetch(`${BASE}/admin/blog/tags`, { headers: auth }).then((r) => r.json());
const cat = (cats.data || []).find((c) => c.name === 'System Design');
const tagIds = (tags.data || [])
  .filter((t) => ['system-design', 'microservices', 'backend', 'scalability', 'architecture'].includes(t.slug))
  .map((t) => t.id);
console.log('category found:', !!cat, cat?.id);
console.log('tags found:', tagIds.length, JSON.stringify(tags.data?.map((t) => t.slug)));

const content = [
  '# Designing Scalable Backend Systems: From Monolith to Microservices',
  '',
  'Building a backend that works is relatively easy. Building one that continues to work as users, features, teams, and traffic grow is much harder.',
  '',
  'Many engineering teams eventually face the same question: **Should we keep the monolith, or should we move toward microservices?**',
  '',
  'The answer is rarely as simple as choosing one architecture over another.',
  '',
  '## When a Monolith Is Actually the Right Choice\n\n' + 'Realistic paragraph content for load testing. '.repeat(25000),
].join('\n');

const payload = {
  title: 'Designing Scalable Backend Systems: From Monolith to Microservices',
  slug: `designing-scalable-backend-systems-from-monolith-to-microservices-${Date.now()}`,
  excerpt:
    'A practical guide to designing backend systems that can evolve from a simple monolith into scalable distributed services without introducing unnecessary complexity.',
  content,
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
  categoryId: cat?.id ?? null,
  tagIds,
};

console.log('content length:', content.length);
console.log('serialized bytes:', Buffer.byteLength(JSON.stringify(payload)));

const t0 = Date.now();
const retry = axios.create();
let res;
try {
  res = await retry.post(`${BASE}/admin/blog/posts`, payload, {
    headers: auth,
    timeout: 120000,
  });
} catch (err) {
  console.log('AXIOS ERROR:', err.message, '| code:', err.code, '| status:', err.response?.status);
  console.log('body:', JSON.stringify(err.response?.data)?.slice(0, 300));
  process.exit(1);
}
console.log('status:', res.status, 'in', Date.now() - t0, 'ms');
console.log('response:', JSON.stringify(res.data).slice(0, 300));
