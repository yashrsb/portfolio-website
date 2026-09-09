import { describe, it, expect, beforeEach, vi } from 'vitest';
import BaseCrudService from '../BaseCrudService';

vi.mock('../api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from '../api/apiClient';

/**
 * Regression tests for the admin blog resource listing contract.
 *
 * The backend wraps responses in:
 *   { success: true, data: [...], meta: {...} }
 *
 * The BaseCrudService must extract the inner `data` so the page receives
 * a plain array (not the envelope). If the page receives the envelope,
 * `items.length === 0` is true (object has no `length`) and the UI
 * shows "No tags found" even when the database has records.
 */
describe('Admin blog resource response unwrapping', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BaseCrudService('blog/tags', { cacheList: false });
  });

  it('extracts the array from the { success, data, meta } envelope', async () => {
    const envelope = {
      success: true,
      data: [
        { id: '1', name: 'microservices', slug: 'microservices' },
        { id: '2', name: 'redis', slug: 'redis' },
      ],
      meta: { timestamp: '2026-09-05T10:00:00.000Z', requestId: 'r1' },
    };
    apiClient.get.mockResolvedValue({ data: envelope });

    const result = await service.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: '1',
      name: 'microservices',
      slug: 'microservices',
    });
  });

  it('returns a single tag from a one-record response as an array of one', async () => {
    const envelope = {
      success: true,
      data: [{ id: '1', name: 'microservices', slug: 'microservices' }],
      meta: { timestamp: '2026-09-05T10:00:00.000Z', requestId: 'r1' },
    };
    apiClient.get.mockResolvedValue({ data: envelope });

    const result = await service.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('microservices');
  });

  it('returns an empty array when the backend has no records', async () => {
    const envelope = {
      success: true,
      data: [],
      meta: { timestamp: '2026-09-05T10:00:00.000Z', requestId: 'r1' },
    };
    apiClient.get.mockResolvedValue({ data: envelope });

    const result = await service.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it('does not return the envelope object itself', async () => {
    const envelope = {
      success: true,
      data: [{ id: '1', name: 'x', slug: 'x' }],
      meta: {},
    };
    apiClient.get.mockResolvedValue({ data: envelope });

    const result = await service.list();

    expect(result).not.toBe(envelope);
    expect(result).not.toHaveProperty('success');
    expect(result).not.toHaveProperty('meta');
  });
});
