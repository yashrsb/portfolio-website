import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockResourceResult = vi.hoisted(() => ({
  data: [],
  loading: false,
  error: null,
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  refresh: vi.fn(),
  clearError: vi.fn(),
}));

vi.mock('../../hooks/useResource', () => ({
  useResource: () => mockResourceResult,
}));

vi.mock('../../hooks/useDirtyForm', () => ({
  useDirtyForm: () => ({ markDirty: vi.fn(), resetDirty: vi.fn() }),
}));

vi.mock('../../services', () => ({
  blogPostService: {
    publish: vi.fn(),
    unpublish: vi.fn(),
  },
  blogCategoryService: { list: vi.fn() },
  blogTagService: { list: vi.fn() },
}));

vi.mock('../../services/api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../components/blog/MarkdownPreview/MarkdownPreview.jsx', () => ({
  default: ({ content }) => (
    <div data-testid="markdown-preview">{content || 'No content'}</div>
  ),
}));

vi.mock('../../components/layout/Breadcrumb/Breadcrumb.jsx', () => ({
  default: () => <nav data-testid="breadcrumb" />,
}));

vi.mock('../../components/common/Button/Button.jsx', () => ({
  default: ({ children, ...props }) => (
    <button type="button" {...props}>{children}</button>
  ),
}));

vi.mock('../../components/common/Badge/Badge.jsx', () => ({
  default: ({ children, variant }) => (
    <span data-variant={variant}>{children}</span>
  ),
}));

vi.mock('../../components/common/DataTable/DataTable.jsx', () => ({
    default: ({ data }) => (
    <div data-testid="datatable">
      {data.length === 0 ? (
        <span>No data</span>
      ) : (
        data.map((row) => (
          <div key={row.id}>{row.title || row.name}</div>
        ))
      )}
    </div>
  ),
}));

vi.mock('../../components/common/Modal/Modal.jsx', () => ({
  default: ({ isOpen, children, title }) =>
    isOpen ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
}));

vi.mock('../../components/common/ConfirmDialog/ConfirmDialog.jsx', () => ({
  default: ({ isOpen, children }) =>
    isOpen ? <div data-testid="confirm-dialog">{children}</div> : null,
}));

vi.mock('../../components/common/SkeletonTable/SkeletonTable.jsx', () => ({
  default: () => <div data-testid="skeleton" />,
}));

vi.mock('../../components/common/errors/ApiErrorBanner/ApiErrorBanner.jsx', () => ({
  default: ({ error }) => <div data-testid="error-banner">{error}</div>,
}));

vi.mock('../../components/form/FormField/FormField.jsx', () => ({
  default: ({ label, children }) => (
    <div data-testid="form-field">{label}{children}</div>
  ),
}));

vi.mock('../../components/form/TextInput/TextInput.jsx', () => ({
  default: (props) => <input data-testid="text-input" {...props} />,
}));

vi.mock('../../components/form/TextArea/TextArea.jsx', () => ({
  default: (props) => <textarea data-testid="textarea" {...props} />,
}));

vi.mock('../../components/form/Select/Select.jsx', () => ({
  default: (props) => <select data-testid="select" {...props} />,
}));

vi.mock('../../components/form/Checkbox/Checkbox.jsx', () => ({
  default: (props) => <input type="checkbox" data-testid="checkbox" {...props} />,
}));

import BlogPostsPage from './BlogPostsPage';
import { blogPostService, blogCategoryService, blogTagService } from '../../services';

describe('BlogPostsPage', () => {
  beforeEach(() => {
    mockResourceResult.data = [];
    mockResourceResult.loading = false;
    mockResourceResult.error = null;
    vi.mocked(blogPostService.publish).mockResolvedValue(true);
    vi.mocked(blogPostService.unpublish).mockResolvedValue(true);
    vi.mocked(blogCategoryService.list).mockResolvedValue([]);
    vi.mocked(blogTagService.list).mockResolvedValue([]);
  });

  it('renders loading state', () => {
    mockResourceResult.loading = true;
    render(<BlogPostsPage />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('renders error banner when error occurs', () => {
    mockResourceResult.loading = false;
    mockResourceResult.error = 'Something went wrong';
    render(<BlogPostsPage />);
    expect(screen.getByTestId('error-banner')).toBeInTheDocument();
  });

  it('renders empty state when no posts', () => {
    mockResourceResult.loading = false;
    mockResourceResult.error = null;
    mockResourceResult.data = [];
    render(<BlogPostsPage />);
    expect(screen.getByText('No blog posts found.')).toBeInTheDocument();
  });

  it('renders posts in table when data is available', () => {
    mockResourceResult.loading = false;
    mockResourceResult.error = null;
    mockResourceResult.data = [
      {
        id: 'post-1',
        title: 'Test Post',
        slug: 'test-post',
        status: 'PUBLISHED',
        featured: true,
        publishedAt: '2025-03-10T00:00:00Z',
      },
    ];
    render(<BlogPostsPage />);
    expect(screen.getByTestId('datatable')).toBeInTheDocument();
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });

  it('renders search box', () => {
    render(<BlogPostsPage />);
    expect(screen.getByPlaceholderText('Search posts...')).toBeInTheDocument();
  });

  it('renders New Post button', () => {
    render(<BlogPostsPage />);
    expect(screen.getByText('New Post')).toBeInTheDocument();
  });
});
