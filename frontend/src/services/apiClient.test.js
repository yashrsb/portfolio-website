import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const { ApiError, invalidateCache, apiClient } = await import('./apiClient');

describe('apiClient', () => {
  beforeEach(() => {
    invalidateCache();
    mockFetch.mockReset();
  });

  describe('GET requests', () => {
    it('fetches data from the API', async () => {
      const mockData = { success: true, data: { id: 1, name: 'Test' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockData),
      });

      const result = await apiClient.get('/test');

      expect(result).toEqual({ id: 1, name: 'Test' });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('unwraps the standard envelope', async () => {
      const mockData = {
        success: true,
        message: 'OK',
        data: [1, 2, 3],
        meta: {},
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockData),
      });

      const result = await apiClient.get('/list');

      expect(result).toEqual([1, 2, 3]);
    });

    it('returns data as-is when no envelope', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockData),
      });

      const result = await apiClient.get('/raw');

      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    it('returns null for 204 No Content', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: { get: () => 'application/json' },
      });

      const result = await apiClient.get('/empty');

      expect(result).toBeNull();
    });
  });

  describe('POST requests', () => {
    it('sends POST request with body', async () => {
      const mockData = { success: true, data: { id: 1 } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockData),
      });

      const result = await apiClient.post('/create', { name: 'Test' });

      expect(result).toEqual({ id: 1 });
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/create');
      expect(options.method).toBe('POST');
      expect(options.body).toBe(JSON.stringify({ name: 'Test' }));
    });

    it('invalidates cache after POST', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      await apiClient.get('/list');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      await apiClient.post('/create', { name: 'Test' });

      await apiClient.get('/list');
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('error handling', () => {
    it('throws ApiError on non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ message: 'Not found' }),
      });

      await expect(apiClient.get('/missing')).rejects.toMatchObject({
        status: 404,
        message: 'Not found',
      });
    });
  });

  describe('caching', () => {
    it('caches GET requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () =>
          Promise.resolve({ success: true, data: { value: 'cached' } }),
      });

      const result1 = await apiClient.get('/cached');
      const result2 = await apiClient.get('/cached');

      expect(result1).toEqual({ value: 'cached' });
      expect(result2).toEqual({ value: 'cached' });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('bypasses cache when skipCache is true', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      await apiClient.get('/data', { skipCache: true });
      await apiClient.get('/data', { skipCache: true });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('invalidates specific cache entries by pattern', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      await apiClient.get('/projects');
      await apiClient.get('/projects');

      expect(mockFetch).toHaveBeenCalledTimes(1);

      invalidateCache('/projects');

      await apiClient.get('/projects');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('invalidates all cache when called with no arguments', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      await apiClient.get('/a');
      await apiClient.get('/b');
      expect(mockFetch).toHaveBeenCalledTimes(2);

      await apiClient.get('/a');
      await apiClient.get('/b');
      expect(mockFetch).toHaveBeenCalledTimes(2);

      invalidateCache();

      await apiClient.get('/a');
      await apiClient.get('/b');
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });
  });

  describe('retry behavior', () => {
    it('retries failed GET requests up to max retries', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network failed'))
        .mockRejectedValueOnce(new Error('Network failed'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: { get: () => 'application/json' },
          json: () => Promise.resolve({ success: true, data: 'ok' }),
        });

      const result = await apiClient.get('/retry');

      expect(result).toBe('ok');
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('does not retry 4xx errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ message: 'Bad request' }),
      });

      await expect(apiClient.get('/bad')).rejects.toMatchObject({
        status: 400,
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('retries on 5xx server errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          headers: { get: () => 'application/json' },
          json: () => Promise.resolve({ message: 'Server error' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: { get: () => 'application/json' },
          json: () => Promise.resolve({ success: true, data: 'ok' }),
        });

      const result = await apiClient.get('/retry-server');

      expect(result).toBe('ok');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('request deduplication', () => {
    it('deduplicates in-flight GET requests with same URL', async () => {
      let resolve;
      const promise = new Promise((r) => {
        resolve = r;
      });
      mockFetch.mockReturnValueOnce(promise);

      const p1 = apiClient.get('/dedupe');
      const p2 = apiClient.get('/dedupe');

      resolve({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ success: true, data: 'shared' }),
      });

      const [r1, r2] = await Promise.all([p1, p2]);

      expect(r1).toBe('shared');
      expect(r2).toBe('shared');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
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

  it('has zero status for network errors', () => {
    const err = new ApiError(0, 'Network error');
    expect(err.status).toBe(0);
  });
});
