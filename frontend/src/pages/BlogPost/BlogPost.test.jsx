import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUseBlogPost = {
  post: null,
  loading: true,
  error: null,
  notFound: false,
};

vi.mock('../../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    constructor(status, message, details) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.details = details;
    }
  },
}));

vi.mock('../../services/blogService', () => ({
  fetchBlogPosts: vi.fn(),
  fetchBlogPost: vi.fn(),
  fetchFeaturedPosts: vi.fn(),
  fetchBlogCategories: vi.fn(),
  fetchBlogTags: vi.fn(),
  toUiPostCard: vi.fn(),
  toUiPostDetail: vi.fn(),
  calculateReadingTime: vi.fn(),
}));

vi.mock('../../services/analyticsService', () => ({
  trackBlogPostView: vi.fn(),
  trackPageView: vi.fn(),
  trackEvent: vi.fn(),
  trackProjectView: vi.fn(),
  trackProjectClick: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useParams: () => ({ slug: 'test-post' }),
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
}));

vi.mock('../../hooks', () => ({
  useBlogPost: () => mockUseBlogPost,
  usePrefersReducedMotion: () => false,
}));

vi.mock('../../components/common/LoadingState/LoadingState', () => ({
  default: ({ label }) => <div data-testid="loading">{label}</div>,
}));

vi.mock('../../components/common/ErrorState/ErrorState', () => ({
  default: ({ title, message }) => (
    <div role="alert">
      <h2>{title}</h2>
      {message && <p>{message}</p>}
    </div>
  ),
}));

vi.mock('../../components/common/Container/Container', () => ({
  default: ({ children }) => children,
}));

vi.mock('../../components/common/Heading/Heading', () => ({
  default: ({ children, subtitle }) => (
    <h1>
      {children}
      {subtitle && <p>{subtitle}</p>}
    </h1>
  ),
}));

vi.mock('../../components/common/Tag/Tag', () => ({
  default: ({ children, variant, size }) => (
    <span className={`tag ${variant} ${size}`}>{children}</span>
  ),
}));

vi.mock('../../components/common/Button/Button', () => ({
  default: ({ children, variant, size, onClick, ariaLabel }) => (
    <button
      className={`button ${variant} ${size}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  ),
}));

vi.mock('../../components/common/Reveal/Reveal', () => ({
  default: ({ children }) => children,
}));

vi.mock('../../components/blog/MarkdownRenderer/MarkdownRenderer', () => ({
  default: ({ content }) => <div data-testid="markdown">{content}</div>,
}));

vi.mock('../../components/blog/TableOfContents/TableOfContents', () => ({
  default: () => <nav>TOC</nav>,
}));

const mockPostUi = (overrides = {}) => ({
  id: 'post-1',
  slug: 'test-post',
  title: 'Test Post Title',
  excerpt: 'Test excerpt',
  content: '# Test\n\nContent',
  coverImage: 'https://example.com/cover.png',
  status: 'PUBLISHED',
  publishedAt: '2025-03-10T00:00:00.000Z',
  updatedAt: '2025-03-15T00:00:00.000Z',
  author: 'Test Author',
  readingTime: 3,
  seoTitle: null,
  seoDescription: null,
  canonicalUrl: null,
  category: { id: 'cat-1', slug: 'backend', name: 'Backend' },
  tags: [{ slug: 'nodejs', name: 'Node.js' }],
  createdAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

import BlogPost from './BlogPost';

describe('BlogPost SEO', () => {
  beforeEach(() => {
    document.head.innerHTML =
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
    mockUseBlogPost.post = null;
    mockUseBlogPost.loading = true;
    mockUseBlogPost.error = null;
    mockUseBlogPost.notFound = false;
  });

  it('sets document.title to post title', () => {
    mockUseBlogPost.loading = false;
    mockUseBlogPost.post = mockPostUi();
    render(<BlogPost />);

    expect(document.title).toBe('Test Post Title — Portfolio Blog');
  });

  it('sets canonical URL to /blog/:slug', () => {
    mockUseBlogPost.loading = false;
    mockUseBlogPost.post = mockPostUi();
    render(<BlogPost />);

    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical).toBeTruthy();
    expect(canonical.getAttribute('href')).toMatch(/\/blog\/test-post$/);
  });

  it('sets og:title and og:description', () => {
    mockUseBlogPost.loading = false;
    mockUseBlogPost.post = mockPostUi();
    render(<BlogPost />);

    expect(document.querySelector('meta[property="og:title"]').content).toBe(
      'Test Post Title',
    );
    expect(
      document.querySelector('meta[property="og:description"]').content,
    ).toBe('Test excerpt');
  });

  it('sets og:image from coverImage', () => {
    mockUseBlogPost.loading = false;
    mockUseBlogPost.post = mockPostUi();
    render(<BlogPost />);

    const img = document.querySelector('meta[property="og:image"]');
    expect(img).toBeTruthy();
    expect(img.content).toBe('https://example.com/cover.png');
  });

  it('sets twitter:card to summary_large_image when coverImage exists', () => {
    mockUseBlogPost.loading = false;
    mockUseBlogPost.post = mockPostUi();
    render(<BlogPost />);

    expect(document.querySelector('meta[name="twitter:card"]').content).toBe(
      'summary_large_image',
    );
  });

  it('sets twitter:card to summary when no coverImage', () => {
    mockUseBlogPost.loading = false;
    mockUseBlogPost.post = mockPostUi({ coverImage: null });
    render(<BlogPost />);

    expect(document.querySelector('meta[name="twitter:card"]').content).toBe(
      'summary',
    );
  });

  it('injects BlogPosting JSON-LD with headline and dates', () => {
    mockUseBlogPost.loading = false;
    mockUseBlogPost.post = mockPostUi();
    render(<BlogPost />);

    const ld = document.getElementById('blog-posting-ld');
    expect(ld).toBeTruthy();
    const data = JSON.parse(ld.textContent);
    expect(data['@type']).toBe('BlogPosting');
    expect(data.headline).toBe('Test Post Title');
    expect(data.datePublished).toBe('2025-03-10T00:00:00.000Z');
    expect(data.dateModified).toBe('2025-03-15T00:00:00.000Z');
    expect(data.author.name).toBe('Test Author');
  });

  it('does NOT inject JSON-LD for draft/unpublished posts', () => {
    mockUseBlogPost.loading = false;
    mockUseBlogPost.post = mockPostUi({ status: 'DRAFT' });
    render(<BlogPost />);

    const ld = document.getElementById('blog-posting-ld');
    expect(ld).toBeFalsy();
  });

  it('sets robots to noindex for unpublished posts', () => {
    mockUseBlogPost.loading = false;
    mockUseBlogPost.post = mockPostUi({ status: 'DRAFT' });
    render(<BlogPost />);

    const robots = document.querySelector('meta[name="robots"]');
    expect(robots).toBeTruthy();
    expect(robots.content).toBe('noindex, nofollow');
  });

  it('injects BreadcrumbList JSON-LD', () => {
    mockUseBlogPost.loading = false;
    mockUseBlogPost.post = mockPostUi();
    render(<BlogPost />);

    const ld = document.getElementById('breadcrumb-ld');
    expect(ld).toBeTruthy();
    const data = JSON.parse(ld.textContent);
    expect(data['@type']).toBe('BreadcrumbList');
    expect(data.itemListElement[0].name).toBe('Blog');
    expect(data.itemListElement[1].name).toBe('Test Post Title');
  });

  it('cleans up JSON-LD tags on unmount', () => {
    mockUseBlogPost.loading = false;
    mockUseBlogPost.post = mockPostUi();
    const { unmount } = render(<BlogPost />);

    expect(document.getElementById('blog-posting-ld')).toBeTruthy();
    expect(document.getElementById('breadcrumb-ld')).toBeTruthy();

    unmount();

    expect(document.getElementById('blog-posting-ld')).toBeFalsy();
    expect(document.getElementById('breadcrumb-ld')).toBeFalsy();
  });

  it('sets noindex when post not found', () => {
    mockUseBlogPost.loading = false;
    mockUseBlogPost.notFound = true;
    render(<BlogPost />);

    const robots = document.querySelector('meta[name="robots"]');
    expect(robots).toBeTruthy();
    expect(robots.content).toBe('noindex, nofollow');
    expect(document.title).toBe('Article Not Found — Portfolio Blog');
  });
});
