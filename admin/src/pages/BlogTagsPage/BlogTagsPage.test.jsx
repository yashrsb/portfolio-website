import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext.jsx';
import BlogTagsPage from './BlogTagsPage';

vi.mock('../../services/api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from '../../services/api/apiClient';

const renderPage = () => {
  const router = createMemoryRouter(
    [
      { path: '/', element: <BlogTagsPage /> },
      { path: '/dashboard', element: <div>Dashboard</div> },
      { path: '/blog', element: <div>Blog</div> },
      { path: '/blog/tags', element: <BlogTagsPage /> },
    ],
    { initialEntries: ['/blog/tags'] },
  );
  return render(
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>,
  );
};

describe('BlogTagsPage — data display regression', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders existing tags returned by the backend', async () => {
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

    renderPage();

    // Must NOT show the empty state when records exist.
    expect(screen.queryByText('No tags found')).not.toBeInTheDocument();

    // Tags must be visible in the table.
    await waitFor(() => {
      expect(screen.getAllByText('microservices').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('redis').length).toBeGreaterThan(0);
  });

  it('shows the empty state when the backend returns an empty array', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: [],
        meta: { timestamp: '2026-09-05T10:00:00.000Z', requestId: 'r1' },
      },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('No tags found')).toBeInTheDocument();
    });
  });

  it('does not show "No tags found" while loading', () => {
    apiClient.get.mockReturnValue(new Promise(() => {})); // never resolves

    renderPage();

    expect(screen.queryByText('No tags found')).not.toBeInTheDocument();
  });
});
