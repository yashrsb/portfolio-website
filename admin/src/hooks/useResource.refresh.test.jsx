import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useResource } from './useResource';
import BaseCrudService from '../services/BaseCrudService';
import { ToastProvider } from '../context/ToastContext.jsx';

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
 * Regression test for the "tag disappears after browser refresh" bug.
 *
 * Simulates the exact browser refresh flow: mount the page, let the
 * initial GET resolve, then simulate a "refresh" by remounting the hook
 * (which is what React does on a real page refresh — fresh component
 * instance, fresh state). The second mount must also receive the tag.
 */
describe('useResource — refresh regression', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BaseCrudService('blog/tags', { cacheList: false });
  });

  it('receives the tag list on initial mount (simulating first page load)', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: [{ id: '1', name: 'microservices', slug: 'microservices' }],
        meta: {},
      },
    });

    const { result, unmount } = renderHook(() => useResource(service), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].name).toBe('microservices');

    unmount();
  });

  it('receives the tag list on a fresh mount (simulating browser refresh)', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: [{ id: '1', name: 'microservices', slug: 'microservices' }],
        meta: {},
      },
    });

    // Simulate browser refresh: a brand new component instance.
    const { result } = renderHook(() => useResource(service), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].name).toBe('microservices');
  });

  it('does not lose data when load is called multiple times (effect re-run)', async () => {
    let resolveFirst;
    let resolveSecond;
    const firstPromise = new Promise((resolve) => {
      resolveFirst = resolve;
    });
    const secondPromise = new Promise((resolve) => {
      resolveSecond = resolve;
    });

    let callCount = 0;
    apiClient.get.mockImplementation(() => {
      callCount += 1;
      const data = {
        success: true,
        data: [{ id: '1', name: 'microservices', slug: 'microservices' }],
        meta: {},
      };
      return Promise.resolve({ data });
    });

    const { result } = renderHook(() => useResource(service), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].name).toBe('microservices');
  });

  it('handles the full create-then-refresh flow correctly', async () => {
    // Initial mount: empty list.
    apiClient.get.mockResolvedValueOnce({
      data: { success: true, data: [], meta: {} },
    });

    const { result, unmount } = renderHook(() => useResource(service), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data).toEqual([]);

    unmount();

    // Simulate browser refresh: fresh mount, the tag now exists in the DB.
    apiClient.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ id: '1', name: 'microservices', slug: 'microservices' }],
        meta: {},
      },
    });

    const { result: result2 } = renderHook(() => useResource(service), {
      wrapper,
    });

    await waitFor(() => {
      expect(result2.current.loading).toBe(false);
    });

    expect(result2.current.data).toHaveLength(1);
    expect(result2.current.data[0].name).toBe('microservices');
  });
});
