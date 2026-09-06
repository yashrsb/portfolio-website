import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildKey, get, set, invalidate, clear, dedupe } from './resourceCache';

describe('resourceCache', () => {
  beforeEach(() => {
    clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('buildKey', () => {
    it('returns the URL when no params are provided', () => {
      expect(buildKey('/admin/projects')).toBe('/admin/projects');
    });

    it('serializes params in sorted order for stable keys', () => {
      expect(buildKey('/admin/projects', { b: 2, a: 1 })).toBe(
        '/admin/projects?{"a":1,"b":2}',
      );
    });
  });

  describe('get/set', () => {
    it('returns undefined for missing keys', () => {
      expect(get('missing')).toBeUndefined();
    });

    it('returns the stored value before expiry', () => {
      set('key', { foo: 1 }, 60_000);
      expect(get('key')).toEqual({ foo: 1 });
    });

    it('returns undefined after expiry and prunes the entry', () => {
      vi.useFakeTimers();
      set('key', { foo: 1 }, 1000);
      vi.advanceTimersByTime(1500);
      expect(get('key')).toBeUndefined();
    });
  });

  describe('invalidate', () => {
    it('removes a specific key without affecting others', () => {
      set('a', 1, 60_000);
      set('b', 2, 60_000);
      invalidate('a');
      expect(get('a')).toBeUndefined();
      expect(get('b')).toBe(2);
    });
  });

  describe('dedupe', () => {
    it('invokes the factory once for simultaneous calls with the same key', async () => {
      const fn = vi.fn().mockResolvedValue('result');
      const [a, b] = await Promise.all([
        dedupe('k', fn),
        dedupe('k', fn),
      ]);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(a).toBe('result');
      expect(b).toBe('result');
    });

    it('returns the cached promise to the second caller', () => {
      const fn = vi.fn().mockResolvedValue('result');
      const a = dedupe('k', fn);
      const b = dedupe('k', fn);
      expect(a).toBe(b);
    });

    it('invokes the factory again after the previous promise settles', async () => {
      const fn = vi.fn().mockResolvedValueOnce('first').mockResolvedValueOnce('second');
      const first = await dedupe('k', fn);
      const second = await dedupe('k', fn);
      expect(fn).toHaveBeenCalledTimes(2);
      expect(first).toBe('first');
      expect(second).toBe('second');
    });

    it('starts a fresh request when the in-flight signal is aborted', async () => {
      const controller = new AbortController();
      const fn = vi
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise((_, reject) => {
              controller.signal.addEventListener('abort', () => {
                const err = new Error('canceled');
                err.name = 'CanceledError';
                err.code = 'ERR_CANCELED';
                reject(err);
              });
            }),
        )
        .mockResolvedValueOnce('fresh');

      const firstCall = dedupe('k', fn, controller.signal);
      // Give the microtask queue a chance to register the inflight entry.
      await Promise.resolve();
      controller.abort();

      // The first call rejects with cancel.
      await expect(firstCall).rejects.toMatchObject({ code: 'ERR_CANCELED' });

      // A second caller after the abort should get a fresh request.
      const secondCall = dedupe('k', fn);
      await expect(secondCall).resolves.toBe('fresh');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('treats an already-aborted signal as not in-flight', async () => {
      const controller = new AbortController();
      controller.abort();
      const fn = vi.fn().mockResolvedValue('ok');
      const result = await dedupe('k', fn, controller.signal);
      expect(result).toBe('ok');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
