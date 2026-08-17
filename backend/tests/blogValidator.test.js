import { describe, it, expect } from 'vitest';
import { blogSlugValidator, blogPostValidators } from '../src/validators/blogValidator.js';

const runValidation = async (req) => {
  for (const rule of blogPostValidators.create) {
    await rule.run(req);
  }
  const { validationResult } = await import('express-validator');
  const result = validationResult(req);
  return {
    passed: result.isEmpty(),
    errors: result.array().map((e) => ({ field: e.path, message: e.msg })),
    sanitizedBody: req.body,
  };
};

describe('blogPostValidators', () => {
  describe('valid blog post', () => {
    it('passes with all required fields correctly filled', async () => {
      const req = {
        body: {
          title: 'My Article',
          slug: 'my-article',
          content: '# My Article\n\nContent here.',
          excerpt: 'Short summary.',
          status: 'PUBLISHED',
          publishedAt: '2025-01-01T00:00:00.000Z',
          featured: false,
          coverImage: null,
          author: 'John Doe',
          seoTitle: 'SEO Title',
          seoDescription: 'SEO Description',
          canonicalUrl: null,
          categoryId: null,
          tagIds: [],
        },
      };
      const result = await runValidation(req);
      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('missing title', () => {
    it('fails when title is empty', async () => {
      const req = {
        body: {
          title: '',
          slug: 'my-article',
          content: 'Content',
        },
      };
      const result = await runValidation(req);
      expect(result.passed).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'title' }),
      );
    });
  });

  describe('missing slug', () => {
    it('fails when slug is empty', async () => {
      const req = {
        body: {
          title: 'My Article',
          slug: '',
          content: 'Content',
        },
      };
      const result = await runValidation(req);
      expect(result.passed).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'slug' }),
      );
    });
  });

  describe('missing content', () => {
    it('fails when content is empty', async () => {
      const req = {
        body: {
          title: 'My Article',
          slug: 'my-article',
          content: '',
        },
      };
      const result = await runValidation(req);
      expect(result.passed).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'content' }),
      );
    });
  });

  describe('invalid slug format', () => {
    it('fails when slug contains spaces', async () => {
      const req = {
        body: {
          title: 'My Article',
          slug: 'my article with spaces',
          content: 'Content',
        },
      };
      const result = await runValidation(req);
      expect(result.passed).toBe(false);
    });
  });

  describe('invalid status', () => {
    it('fails when status is not one of the allowed values', async () => {
      const req = {
        body: {
          title: 'My Article',
          slug: 'my-article',
          content: 'Content',
          status: 'INVALID',
        },
      };
      const result = await runValidation(req);
      expect(result.passed).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'status' }),
      );
    });
  });

  describe('valid slug format', () => {
    it('passes when slug uses hyphens', async () => {
      const req = {
        body: {
          title: 'My Article',
          slug: 'my-article-title',
          content: 'Content',
        },
      };
      const result = await runValidation(req);
      expect(result.passed).toBe(true);
    });
  });

  describe('blogSlugValidator', () => {
    it('is an array of validation rules', () => {
      expect(Array.isArray(blogSlugValidator)).toBe(true);
      expect(blogSlugValidator.length).toBeGreaterThan(0);
    });
  });
});
