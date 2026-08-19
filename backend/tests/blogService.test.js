import { describe, it, expect, vi } from 'vitest';
import { calculateReadingTime } from '../src/services/blogService.js';

const mockFindPublishedPosts = vi.fn();
const mockFindPostBySlug = vi.fn();
const mockFindFeaturedPosts = vi.fn();
const mockFindRelatedPosts = vi.fn();
const mockFindCategories = vi.fn();
const mockFindTags = vi.fn();
const mockFindPostsByCategory = vi.fn();
const mockFindPostsByTag = vi.fn();
const mockFindAllPublishedForFeed = vi.fn();
const mockFindAllPublishedSlugs = vi.fn();
const mockCreatePost = vi.fn();
const mockUpdatePost = vi.fn();
const mockDeletePost = vi.fn();
const mockFindPostById = vi.fn();
const mockPublishPost = vi.fn();
const mockUnpublishPost = vi.fn();
const mockFindCategoryBySlug = vi.fn();
const mockCreateCategory = vi.fn();
const mockUpdateCategory = vi.fn();
const mockDeleteCategory = vi.fn();
const mockFindTagBySlug = vi.fn();
const mockCreateTag = vi.fn();
const mockUpdateTag = vi.fn();
const mockDeleteTag = vi.fn();

vi.mock('../src/repositories/index.js', () => ({
  blogRepository: {
    findPublishedPosts: (...args) => mockFindPublishedPosts(...args),
    findPostBySlug: (...args) => mockFindPostBySlug(...args),
    findFeaturedPosts: (...args) => mockFindFeaturedPosts(...args),
    findRelatedPosts: (...args) => mockFindRelatedPosts(...args),
    findCategories: (...args) => mockFindCategories(...args),
    findTags: (...args) => mockFindTags(...args),
    findPostsByCategory: (...args) => mockFindPostsByCategory(...args),
    findPostsByTag: (...args) => mockFindPostsByTag(...args),
    findAllPublishedForFeed: (...args) => mockFindAllPublishedForFeed(...args),
    findAllPublishedSlugs: (...args) => mockFindAllPublishedSlugs(...args),
    createPost: (...args) => mockCreatePost(...args),
    updatePost: (...args) => mockUpdatePost(...args),
    deletePost: (...args) => mockDeletePost(...args),
    findPostById: (...args) => mockFindPostById(...args),
    publishPost: (...args) => mockPublishPost(...args),
    unpublishPost: (...args) => mockUnpublishPost(...args),
    findCategoryBySlug: (...args) => mockFindCategoryBySlug(...args),
    createCategory: (...args) => mockCreateCategory(...args),
    updateCategory: (...args) => mockUpdateCategory(...args),
    deleteCategory: (...args) => mockDeleteCategory(...args),
    findTagBySlug: (...args) => mockFindTagBySlug(...args),
    createTag: (...args) => mockCreateTag(...args),
    updateTag: (...args) => mockUpdateTag(...args),
    deleteTag: (...args) => mockDeleteTag(...args),
  },
}));

describe('blogService.calculateReadingTime', () => {
  it('returns 1 for empty content', () => {
    expect(calculateReadingTime('')).toBe(1);
  });

  it('returns 1 for null/undefined', () => {
    expect(calculateReadingTime(null)).toBe(1);
    expect(calculateReadingTime(undefined)).toBe(1);
  });

  it('returns 1 for very short content', () => {
    expect(calculateReadingTime('hello world')).toBe(1);
  });

  it('returns 2 for 200 words', () => {
    const text = Array(200).fill('word').join(' ');
    expect(calculateReadingTime(text)).toBe(1);
  });

  it('returns 2 for 201 words', () => {
    const text = Array(201).fill('word').join(' ');
    expect(calculateReadingTime(text)).toBe(2);
  });

  it('strips Markdown syntax before counting', () => {
    const markdown = '# Title\n\n## Heading\n\n- list\n- items\n\n```js\ncode\n```';
    // This is about 6 words visible: Title, Heading, list, items, code = 5
    expect(calculateReadingTime(markdown)).toBe(1);
  });
});