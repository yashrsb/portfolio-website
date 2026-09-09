import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();

vi.mock('./apiClient', () => ({
  apiClient: {
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args),
    put: (...args) => mockPut(...args),
    delete: (...args) => mockDelete(...args),
  },
}));

import {
  fetchBlogPosts,
  fetchBlogPost,
  fetchFeaturedPosts,
  fetchBlogCategories,
  fetchBlogTags,
  fetchPostsByCategory,
  fetchPostsByTag,
  fetchBlogSitemapData,
} from './blogService';

describe('blogService', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  describe('fetchBlogPosts', () => {
    it('returns mapped posts from unwrapped API response', async () => {
      const mockPosts = [
        {
          id: '1',
          slug: 'test-post',
          title: 'Test Post',
          excerpt: 'Excerpt',
          content: '# Test',
          coverImage: null,
          status: 'PUBLISHED',
          publishedAt: '2025-03-10T00:00:00Z',
          author: 'Author',
          featured: false,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          category: { id: 'c1', slug: 'backend', name: 'Backend' },
          tags: [{ id: 't1', slug: 'nodejs', name: 'Node.js' }],
        },
      ];

      mockGet.mockResolvedValueOnce(Object.assign([...mockPosts], {
        _meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      }));

      const result = await fetchBlogPosts({}, new AbortController().signal);

      expect(result.posts).toHaveLength(1);
      expect(result.posts[0]).toMatchObject({
        id: '1',
        slug: 'test-post',
        title: 'Test Post',
        category: { slug: 'backend', name: 'Backend' },
        tags: [{ slug: 'nodejs', name: 'Node.js' }],
      });
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      });
    });

    it('returns empty posts when API returns empty array', async () => {
      mockGet.mockResolvedValueOnce([]);

      const result = await fetchBlogPosts({});

      expect(result.posts).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('passes query params to the API client', async () => {
      mockGet.mockResolvedValueOnce([]);

      await fetchBlogPosts({ page: 2, search: 'test' });

      expect(mockGet).toHaveBeenCalledWith('/blog/posts', {
        params: { page: 2, search: 'test' },
        signal: undefined,
      });
    });

    it('uses default pagination when meta is absent', async () => {
      mockGet.mockResolvedValueOnce([]);

      const result = await fetchBlogPosts({});

      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      });
    });
  });

  describe('fetchBlogPost', () => {
    it('returns a single post mapped to UI detail shape', async () => {
      const mockPostData = {
        id: '1',
        slug: 'my-post',
        title: 'My Post',
        excerpt: 'Excerpt',
        content: '# Content',
        coverImage: 'https://example.com/img.png',
        status: 'PUBLISHED',
        publishedAt: '2025-03-10T00:00:00Z',
        author: 'Author',
        featured: false,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        seoTitle: 'My Post SEO',
        seoDescription: 'Description',
        canonicalUrl: null,
        category: { id: 'c1', slug: 'backend', name: 'Backend' },
        tags: [{ id: 't1', slug: 'nodejs', name: 'Node.js' }],
      };

      mockGet.mockResolvedValueOnce(mockPostData);

      const result = await fetchBlogPost('my-post');

      expect(result).toMatchObject({
        id: '1',
        slug: 'my-post',
        title: 'My Post',
        content: '# Content',
        coverImage: 'https://example.com/img.png',
        seoTitle: 'My Post SEO',
        seoDescription: 'Description',
        category: { slug: 'backend', name: 'Backend' },
        tags: [{ slug: 'nodejs', name: 'Node.js' }],
      });
    });
  });

  describe('fetchFeaturedPosts', () => {
    it('returns mapped featured posts', async () => {
      const mockPosts = [
        {
          id: '1',
          slug: 'featured-post',
          title: 'Featured',
          content: '# Content',
          status: 'PUBLISHED',
          publishedAt: '2025-03-10T00:00:00Z',
          featured: true,
          category: null,
          tags: [],
        },
      ];

      mockGet.mockResolvedValueOnce([...mockPosts]);

      const result = await fetchFeaturedPosts(3);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Featured');
      expect(result[0].featured).toBe(true);
    });

    it('returns empty array when no featured posts', async () => {
      mockGet.mockResolvedValueOnce([]);

      const result = await fetchFeaturedPosts(3);

      expect(result).toEqual([]);
    });
  });

  describe('fetchBlogCategories', () => {
    it('returns categories from unwrapped response', async () => {
      const mockCategories = [
        { id: 'c1', slug: 'backend', name: 'Backend', description: 'Backend articles' },
        { id: 'c2', slug: 'system-design', name: 'System Design', description: 'Design articles' },
      ];

      mockGet.mockResolvedValueOnce([...mockCategories]);

      const result = await fetchBlogCategories();

      expect(result).toEqual(mockCategories);
    });

    it('returns empty array when no categories', async () => {
      mockGet.mockResolvedValueOnce([]);

      const result = await fetchBlogCategories();

      expect(result).toEqual([]);
    });
  });

  describe('fetchBlogTags', () => {
    it('returns tags from unwrapped response', async () => {
      const mockTags = [
        { id: 't1', slug: 'nodejs', name: 'Node.js' },
        { id: 't2', slug: 'react', name: 'React' },
      ];

      mockGet.mockResolvedValueOnce([...mockTags]);

      const result = await fetchBlogTags();

      expect(result).toEqual(mockTags);
    });

    it('returns empty array when no tags', async () => {
      mockGet.mockResolvedValueOnce([]);

      const result = await fetchBlogTags();

      expect(result).toEqual([]);
    });
  });

  describe('fetchPostsByCategory', () => {
    it('returns posts, category, and pagination from _meta', async () => {
      const mockPosts = [
        {
          id: '1',
          slug: 'post-1',
          title: 'Post 1',
          content: '# Content',
          status: 'PUBLISHED',
          publishedAt: '2025-03-10T00:00:00Z',
          category: { id: 'c1', slug: 'backend', name: 'Backend' },
          tags: [],
        },
      ];

      mockGet.mockResolvedValueOnce(
        Object.assign([...mockPosts], {
          _meta: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false,
            category: { id: 'c1', slug: 'backend', name: 'Backend' },
          },
        }),
      );

      const result = await fetchPostsByCategory('backend');

      expect(result.posts).toHaveLength(1);
      expect(result.category).toEqual({ id: 'c1', slug: 'backend', name: 'Backend' });
      expect(result.pagination.page).toBe(1);
    });
  });

  describe('fetchPostsByTag', () => {
    it('returns posts, tag, and pagination from _meta', async () => {
      const mockPosts = [
        {
          id: '1',
          slug: 'post-1',
          title: 'Post 1',
          content: '# Content',
          status: 'PUBLISHED',
          publishedAt: '2025-03-10T00:00:00Z',
          category: null,
          tags: [{ id: 't1', slug: 'nodejs', name: 'Node.js' }],
        },
      ];

      mockGet.mockResolvedValueOnce(
        Object.assign([...mockPosts], {
          _meta: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false,
            tag: { id: 't1', slug: 'nodejs', name: 'Node.js' },
          },
        }),
      );

      const result = await fetchPostsByTag('nodejs');

      expect(result.posts).toHaveLength(1);
      expect(result.tag).toEqual({ id: 't1', slug: 'nodejs', name: 'Node.js' });
    });
  });

  describe('fetchBlogSitemapData', () => {
    it('returns sitemap data from unwrapped response', async () => {
      const mockSitemap = [
        { slug: 'post-1', lastmod: '2025-03-10T00:00:00Z' },
        { slug: 'post-2', lastmod: '2025-03-11T00:00:00Z' },
      ];

      mockGet.mockResolvedValueOnce([...mockSitemap]);

      const result = await fetchBlogSitemapData();

      expect(result).toEqual(mockSitemap);
    });
  });
});
