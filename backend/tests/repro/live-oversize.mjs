// Live test: what does the RUNNING server return for an oversized (>2mb) body?
import fs from 'fs';

const BASE = 'http://localhost:5001/api/v1';
const env = fs.readFileSync(new URL('../../.env', import.meta.url), 'utf8');
const pw = env.match(/^ADMIN_PASSWORD=(.*)$/m)[1].trim();

const login = await fetch(`${BASE}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@portfolio.com', password: pw }),
}).then((r) => r.json());
const auth = {
  Authorization: `Bearer ${login?.data?.accessToken}`,
  'Content-Type': 'application/json',
};

const payload = {
  title: 'Oversize probe',
  slug: `oversize-probe-${Date.now()}`,
  content: 'x'.repeat(3 * 1024 * 1024),
};

const res = await fetch(`${BASE}/admin/blog/posts`, {
  method: 'POST',
  headers: auth,
  body: JSON.stringify(payload),
});
const text = await res.text();
console.log('status:', res.status, 'bytes:', Buffer.byteLength(text));
console.log('body:', text);
