import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('tokenStore', () => {
  let tokenStore;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    sessionStorage.clear();
    tokenStore = await import('../tokenStore.js');
  });

  describe('getAccessToken', () => {
    it('returns null when no token is set', () => {
      expect(tokenStore.getAccessToken()).toBeNull();
    });

    it('returns token from memory when set', () => {
      tokenStore.setAccessToken('test-token');
      expect(tokenStore.getAccessToken()).toBe('test-token');
    });

    it('falls back to sessionStorage when memory is cleared', () => {
      sessionStorage.setItem('portfolio_access_token', 'stored-token');
      expect(tokenStore.getAccessToken()).toBe('stored-token');
    });
  });

  describe('setAccessToken', () => {
    it('stores token in memory and sessionStorage', () => {
      tokenStore.setAccessToken('new-token');

      expect(tokenStore.getAccessToken()).toBe('new-token');
      expect(sessionStorage.getItem('portfolio_access_token')).toBe(
        'new-token',
      );
    });
  });

  describe('clearSession', () => {
    it('clears token from memory and sessionStorage', () => {
      tokenStore.setAccessToken('test-token');
      tokenStore.clearSession();

      expect(tokenStore.getAccessToken()).toBeNull();
      expect(sessionStorage.getItem('portfolio_access_token')).toBeNull();
    });
  });
});

describe('normalizeApiError', () => {
  let normalizeApiError;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    const mod = await import('../../utils/apiErrors.js');
    normalizeApiError = mod.normalizeApiError;
  });

  it('extracts message from API error response', () => {
    const error = {
      response: {
        data: { message: 'Validation failed', code: 'VALIDATION_ERROR' },
        status: 422,
      },
    };

    const result = normalizeApiError(error);

    expect(result.message).toBe('Validation failed');
    expect(result.status).toBe(422);
  });

  it('returns network error message when no response', () => {
    const error = { request: {}, message: 'Network Error' };

    const result = normalizeApiError(error);

    expect(result.message).toBe(
      'Unable to reach the server. Check your connection and try again.',
    );
    expect(result.isNetworkError).toBe(true);
  });

  it('handles timeout errors', () => {
    const error = { code: 'ECONNABORTED' };

    const result = normalizeApiError(error);

    expect(result.message).toBe('The request timed out. Please try again.');
  });

  it('extracts field errors from validation response', () => {
    const error = {
      response: {
        data: {
          code: 'VALIDATION_ERROR',
          errors: [
            { field: 'email', message: 'Invalid email' },
            { field: 'password', message: 'Too short' },
          ],
        },
        status: 422,
      },
    };

    const result = normalizeApiError(error);

    expect(result.fieldErrors).toEqual([
      { field: 'email', message: 'Invalid email' },
      { field: 'password', message: 'Too short' },
    ]);
  });
});
