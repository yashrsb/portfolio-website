/**
 * Diagnostic script that reproduces the exact browser flow:
 * 1. Login → get access token
 * 2. Call GET /admin/blog/tags with the token
 * 3. Inspect the raw response
 *
 * Run with: node tests/diagnose-tags-refresh.mjs
 */
import axios from 'axios';

const BASE = 'http://localhost:5001/api/v1';

async function diagnose() {
  // Step 1: Login
  const loginRes = await axios.post(`${BASE}/auth/login`, {
    email: 'admin@portfolio.com',
    password: 'BFg2nK3JG',
  });
  const token = loginRes.data.data.accessToken;
  console.log('Login OK. Token (first 30 chars):', token.slice(0, 30));

  // Step 2: Call GET /admin/blog/tags
  const tagsRes = await axios.get(`${BASE}/admin/blog/tags`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log('\n--- Response inspection ---');
  console.log('Status:', tagsRes.status);
  console.log('Top-level keys:', Object.keys(tagsRes.data));
  console.log('success:', tagsRes.data.success);
  console.log('data type:', Array.isArray(tagsRes.data.data) ? 'array' : typeof tagsRes.data.data);
  console.log('data length:', tagsRes.data.data?.length);
  console.log(
    'First 3 records:',
    tagsRes.data.data?.slice(0, 3).map((r) => `${r.name} (${r.slug})`),
  );
  console.log('Has microservices:', tagsRes.data.data?.some((r) => r.name === 'microservices'));

  // Step 3: Check what apiClient.get would return
  console.log('\n--- Simulating apiClient.get return value ---');
  // apiClient.get resolves to the full axios response object
  // BaseCrudService.list does: const { data } = await apiClient.get(...)
  // then returns data.data
  const { data } = tagsRes; // simulates what apiClient.get resolves to
  const extracted = data.data; // simulates BaseCrudService.list
  console.log('Extracted type:', Array.isArray(extracted) ? 'array' : typeof extracted);
  console.log('Extracted length:', extracted?.length);
  console.log(
    'Extracted first 3:',
    extracted?.slice(0, 3).map((r) => r.name),
  );
}

diagnose().catch(console.error);
