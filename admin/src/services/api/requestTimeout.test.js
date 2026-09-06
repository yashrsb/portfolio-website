/**
 * Regression tests for the admin API client timeout.
 *
 * Root cause of the "Network error" on blog post creation: the axios
 * REQUEST_TIMEOUT (previously 15s) was shorter than the real round-trip time
 * for a long-form (~1.15 MB Markdown) blog post written to hosted Neon
 * Postgres (measured 13–38s locally). The client aborted, axios rejected
 * with no `response`, and normalizeApiError classified it as a network
 * error — while the backend eventually returned 201 (or a logged 400 for
 * aborted sockets).
 */
import { describe, it, expect, vi } from 'vitest';

describe('REQUEST_TIMEOUT regression', () => {
  it('allows more than 15s so long-form post writes are not aborted', async () => {
    vi.resetModules();
    const { REQUEST_TIMEOUT } = await import('../../constants/api');
    expect(REQUEST_TIMEOUT).toBeGreaterThan(15000);
  });

  it('remains bounded (no unbounded wait)', async () => {
    vi.resetModules();
    const { REQUEST_TIMEOUT } = await import('../../constants/api');
    expect(REQUEST_TIMEOUT).toBeLessThanOrEqual(120000);
  });
});
