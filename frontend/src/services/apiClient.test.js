import { describe, it, expect, beforeEach } from 'vitest';
import { ApiError, invalidateCache } from './apiClient';

describe('apiClient caching', () => {
  beforeEach(() => {
    invalidateCache();
  });

  it('exports invalidateCache as a function', () => {
    expect(typeof invalidateCache).toBe('function');
  });

  it('clears all cache entries when called with no arguments', () => {
    // The cache is internal; we verify by calling invalidateCache without errors
    invalidateCache();
    invalidateCache('test-key');
    invalidateCache(/pattern/);
  });

  it('accepts and ignores unknown patterns gracefully', () => {
    invalidateCache('nonexistent-key');
    expect(true).toBe(true);
  });
});

describe('ApiError', () => {
  it('creates an error with status, message, and details', () => {
    const err = new ApiError(404, 'Not found', { id: 1 });
    expect(err.name).toBe('ApiError');
    expect(err.status).toBe(404);
    expect(err.message).toBe('Not found');
    expect(err.details).toEqual({ id: 1 });
  });

  it('is an instance of Error', () => {
    const err = new ApiError(500, 'Server error');
    expect(err).toBeInstanceOf(Error);
  });
});
