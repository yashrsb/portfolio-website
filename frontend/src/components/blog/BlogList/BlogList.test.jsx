import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockPosts,
  mockUseBlogPosts,
  mockUseBlogCategories,
  mockUseBlogTags,
} = vi.hoisted(() => {
  const posts = [
    {
      id: '1',
      slug: 'featured-post',
      title: 'Featured Post',
      content: '# Content',
      excerpt: 'Featured excerpt',
      coverImage: null,
      status: 'PUBLISHED',
      publishedAt: '2025-03-10T00:00:00Z',
      author: 'Author',
      readingTime: 3,
      featured: true,
      category: { slug: 'backend', name: 'Backend' },
      tags: [{ slug: 'nodejs', name: 'Node.js' }],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: '2',
      slug: 'regular-post',
      title: 'Regular Post',
      content: '# Content',
      excerpt: 'Regular excerpt',
      coverImage: null,
      status: 'PUBLISHED',
      publishedAt: '2025-03-09T00:00:00Z',
      author: 'Author',
      readingTime: 5,
      featured: false,
      category: { slug: 'system-design', name: 'System Design' },
      tags: [{ slug: 'architecture', name: 'Architecture' }],
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    },
    {
      id: '3',
      slug: 'another-post',
      title: 'Another Post',
      content: '# Content',
      excerpt: 'Another excerpt',
      coverImage: null,
      status: 'PUBLISHED',
      publishedAt: '2025-03-08T00:00:00Z',
      author: 'Author',
      readingTime: 2,
      featured: false,
      category: null,
      tags: [],
      createdAt: '2025-01-03T00:00:00Z',
      updatedAt: '2025-01-03T00:00:00Z',
    },
  ];

  return {
    mockPosts: posts,
    mockUseBlogPosts: {
      posts: [...posts],
      pagination: {
        page: 1,
        limit: 10,
        total: 3,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
      loading: false,
      error: null,
    },
    mockUseBlogCategories: {
      categories: [
        { id: 'c1', slug: 'backend', name: 'Backend' },
        { id: 'c2', slug: 'system-design', name: 'System Design' },
      ],
      loading: false,
    },
    mockUseBlogTags: {
      tags: [
        { id: 't1', slug: 'nodejs', name: 'Node.js' },
        { id: 't2', slug: 'architecture', name: 'Architecture' },
      ],
      loading: false,
    },
  };
});

vi.mock('../../../hooks', () => ({
  useBlogPosts: () => mockUseBlogPosts,
  useBlogCategories: () => mockUseBlogCategories,
  useBlogTags: () => mockUseBlogTags,
}));

vi.mock('../../blog/BlogPostCard/BlogPostCard', () => ({
  default: ({ post }) => (
    <div data-testid={`post-card-${post.id}`}>{post.title}</div>
  ),
}));

vi.mock('../../common/ErrorState/ErrorState', () => ({
  default: ({ title, message, onRetry, retryLabel }) => (
    <div data-testid="error-state" role="alert">
      <h2>{title}</h2>
      {message && <p>{message}</p>}
      {onRetry && (
        <button type="button" onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  ),
}));

vi.mock('../../common/Reveal/Reveal', () => ({
  default: ({ children }) => children,
}));

vi.mock('../../common/Button/Button', () => ({
  default: ({ children, ...props }) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

import BlogList from './BlogList';

describe('BlogList', () => {
  beforeEach(() => {
    mockUseBlogPosts.posts = [...mockPosts];
    mockUseBlogPosts.pagination = {
      page: 1,
      limit: 10,
      total: 3,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    };
    mockUseBlogPosts.loading = false;
    mockUseBlogPosts.error = null;
  });

  it('renders loading state with skeleton cards', () => {
    mockUseBlogPosts.loading = true;
    render(<BlogList />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders error state with message and retry button', () => {
    mockUseBlogPosts.loading = false;
    mockUseBlogPosts.error = 'Failed to load posts';
    render(<BlogList />);

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Failed to load posts')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('renders featured article section when a post is featured', () => {
    render(<BlogList />);

    expect(screen.getByText('Featured Article')).toBeInTheDocument();
    expect(screen.getByTestId('post-card-1')).toBeInTheDocument();
    expect(screen.getByText('Featured Post')).toBeInTheDocument();
  });

  it('renders non-featured posts in the grid', () => {
    render(<BlogList />);

    expect(screen.getByTestId('post-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('post-card-3')).toBeInTheDocument();
  });

  it('does not render featured section when no posts are featured', () => {
    mockUseBlogPosts.posts = [
      { ...mockPosts[1], featured: false },
      { ...mockPosts[2], featured: false },
    ];

    render(<BlogList />);

    expect(screen.queryByText('Featured Article')).not.toBeInTheDocument();
  });

  it('renders "No articles published yet" when no posts and no filters', () => {
    mockUseBlogPosts.posts = [];
    mockUseBlogPosts.pagination.total = 0;

    render(<BlogList />);

    expect(
      screen.getByText('No articles published yet.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('No articles found.'),
    ).not.toBeInTheDocument();
  });

  it('renders "No articles found" when no posts and category filter active', () => {
    mockUseBlogPosts.posts = [];
    mockUseBlogPosts.pagination.total = 0;

    render(<BlogList initialQuery={{ category: 'backend' }} />);

    expect(screen.getByText('No articles found.')).toBeInTheDocument();
  });

  it('renders search input with correct placeholder and aria-label', () => {
    render(<BlogList />);

    const input = screen.getByPlaceholderText('Search articles by title, topic, or keyword...');
    expect(input).toHaveAttribute('aria-label', 'Search blog posts');
  });

  it('renders category filter buttons', () => {
    render(<BlogList />);

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
    expect(screen.getByText('System Design')).toBeInTheDocument();
  });

  it('renders tag cloud when showTagCloud is true', () => {
    render(<BlogList />);

    expect(screen.getByText('Browse by tag')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('hides tag cloud when showTagCloud is false', () => {
    render(<BlogList showTagCloud={false} />);

    expect(screen.queryByText('Browse by tag')).not.toBeInTheDocument();
  });

  it('hides search when showSearch is false', () => {
    render(<BlogList showSearch={false} />);

    expect(
      screen.queryByPlaceholderText('Search articles by title, topic, or keyword...'),
    ).not.toBeInTheDocument();
  });

  it('hides category filter when showCategoryFilter is false', () => {
    render(<BlogList showCategoryFilter={false} />);

    expect(screen.queryByText('Categories')).not.toBeInTheDocument();
  });

  it('renders pagination when totalPages > 1', () => {
    mockUseBlogPosts.pagination = {
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNext: true,
      hasPrevious: false,
    };

    render(<BlogList />);

    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('Next →')).toBeInTheDocument();
    expect(screen.getByText('← Previous')).toBeInTheDocument();
  });

  it('does not render pagination when totalPages <= 1', () => {
    render(<BlogList />);

    expect(screen.queryByText(/Page \d+ of/)).not.toBeInTheDocument();
  });
});
