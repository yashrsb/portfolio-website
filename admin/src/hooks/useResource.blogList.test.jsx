import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { ToastProvider } from '../context/ToastContext.jsx';
import { useResource } from './useResource';
import BaseCrudService from '../services/BaseCrudService';

vi.mock('../services/api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from '../services/api/apiClient';

const wrapper = ({ children }) => <ToastProvider>{children}</ToastProvider>;

/**
 * Regression test for the Admin Blog listing bug:
 * "No tags found" displayed even though the backend returned records.
 *
 * The test exercises the real useResource → BaseCrudService → apiClient
 * chain with a mocked HTTP layer to confirm that a backend response of
 * `{ success: true, data: [...records] }` reaches the component as a
 * plain array of records (not the envelope, not undefined).
 */
describe('useResource + BaseCrudService — blog listing data flow', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BaseCrudService('blog/tags', { cacheList: false });
  });

  it('exposes existing tags as a plain array in component state', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: [
          { id: '1', name: 'microservices', slug: 'microservices' },
          { id: '2', name: 'redis', slug: 'redis' },
        ],
        meta: { timestamp: '2026-09-05T10:00:00.000Z', requestId: 'r1' },
      },
    });

    const { result } = renderHook(() => useResource(service), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0].name).toBe('microservices');
  });

  it('exposes a single record as an array of one', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: [{ id: '1', name: 'microservices', slug: 'microservices' }],
        meta: { timestamp: '2026-09-05T10:00:00.000Z', requestId: 'r1' },
      },
    });

    const { result } = renderHook(() => useResource(service), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].name).toBe('microservices');
  });

  it('exposes an empty array when the backend has no records', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: [],
        meta: { timestamp: '2026-09-05T10:00:00.000Z', requestId: 'r1' },
      },
    });

    const { result } = renderHook(() => useResource(service), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
  });

  it('refreshes the list after a create so the new tag appears', async () => {
    // First call: empty list.
    // Second call (after invalidate + refetch): list with the new tag.
    apiClient.get
      .mockResolvedValueOnce({
        data: { success: true, data: [], meta: { timestamp: 't1', requestId: 'r1' } },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: [{ id: '1', name: 'microservices', slug: 'microservices' }],
          meta: { timestamp: 't2', requestId: 'r2' },
        },
      });

    apiClient.post.mockResolvedValue({
      data: {
        success: true,
        data: { id: '1', name: 'microservices', slug: 'microservices' },
        meta: { timestamp: 't2', requestId: 'r2' },
      },
    });

    const { result } = renderHook(() => useResource(service), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data).toEqual([]);

    await act(async () => {
      const created = await result.current.create({
        name: 'microservices',
        slug: 'microservices',
      });
      expect(created).toBeTruthy();
    });

    // After create, the list should reflect the newly created tag (either
    // via the optimistic update or via the invalidated refetch).
    await waitFor(() => {
      expect(result.current.data).toHaveLength(1);
    });
    expect(result.current.data[0].name).toBe('microservices');
  });
});
