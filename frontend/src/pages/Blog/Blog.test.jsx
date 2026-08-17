import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPosts = {
  posts: [
    {
      id: '1',
      slug: 'test-post',
      title: 'Test Post',
      excerpt: 'Test excerpt',
      content: 'Content',
      coverImage: null,
      status: 'PUBLISHED',
      publishedAt: '2025-03-10T00:00:00Z',
      author: 'Test Author',
      readingTime: 3,
      featured: true,
      seoTitle: null,
      seoDescription: null,
      canonicalUrl: null,
      category: { id: 'cat-1', slug: 'backend', name: 'Backend' },
      tags: [{ id: 'tag-1', slug: 'nodejs', name: 'Node.js' }],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  },
};

vi.mock('../../services/blogService', () => ({
  fetchBlogPosts: vi.fn(),
  fetchFeaturedPosts: vi.fn(),
  fetchBlogCategories: vi.fn(),
  fetchBlogTags: vi.fn(),
  toUiPostCard: vi.fn(),
  calculateReadingTime: vi.fn(),
}));

const mockUseBlogPosts = vi.hoisted(() => ({
  posts: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  },
  loading: false,
  error: null,
}));

const mockUseBlogCategories = vi.hoisted(() => ({
  categories: [],
  loading: false,
}));

const mockUseBlogTags = vi.hoisted(() => ({
  tags: [],
  loading: false,
}));

vi.mock('../../hooks', () => ({
  useBlogPosts: () => mockUseBlogPosts,
  useBlogCategories: () => mockUseBlogCategories,
  useBlogTags: () => mockUseBlogTags,
}));

vi.mock('../../components/common/LoadingState/LoadingState', () => ({
  default: ({ label }) => <div data-testid="loading">{label}</div>,
}));

vi.mock('../../components/blog/BlogPostCard/BlogPostCard', () => ({
  default: ({ post }) => (
    <div data-testid={`post-card-${post.id}`}>{post.title}</div>
  ),
}));

vi.mock('../../components/common/Reveal/Reveal', () => ({
  default: ({ children }) => children,
}));

vi.mock('../../components/common/Button/Button', () => ({
  default: ({ children, ...props }) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

import Blog from './Blog';

describe('Blog page', () => {
  beforeEach(() => {
    mockUseBlogPosts.posts = [];
    mockUseBlogPosts.loading = false;
    mockUseBlogPosts.error = null;
    mockUseBlogPosts.pagination = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    };
    mockUseBlogCategories.categories = [];
    mockUseBlogTags.tags = [];
  });

  it('renders loading state', () => {
    mockUseBlogPosts.loading = true;
    render(<Blog />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders error state when error occurs', () => {
    mockUseBlogPosts.loading = false;
    mockUseBlogPosts.error = 'Failed to load posts';
    render(<Blog />);
    expect(screen.getByText('Failed to load posts')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('renders empty state when no posts found', () => {
    mockUseBlogPosts.loading = false;
    mockUseBlogPosts.error = null;
    mockUseBlogPosts.posts = [];
    render(<Blog />);
    expect(screen.getByText('No articles found.')).toBeInTheDocument();
  });

  it('renders post cards when posts are available', () => {
    mockUseBlogPosts.loading = false;
    mockUseBlogPosts.error = null;
    mockUseBlogPosts.posts = mockPosts.posts;
    mockUseBlogPosts.pagination = mockPosts.pagination;
    render(<Blog />);
    expect(screen.getByTestId('post-card-1')).toBeInTheDocument();
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });
});
