import { apiClient } from './apiClient';

const WORDS_PER_MINUTE = 200;

/**
 * Calculates estimated reading time in minutes from Markdown content.
 * Strips Markdown syntax to get a plain word count.
 * @param {string} content - Markdown content.
 * @returns {number} Minutes (minimum 1).
 */
export const calculateReadingTime = (content) => {
  if (!content || typeof content !== 'string') return 1;

  const plain = content
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[[^\]]*]\([^)]*\)/g, '$2')
    .replace(/[#*`>~\-+=|]/g, ' ')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = plain.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / WORDS_PER_MINUTE);
  return Math.max(minutes, 1);
};

/**
 * Maps an API post response to the UI card shape.
 * @param {object} post - API post.
 * @returns {object} UI post card.
 */
const toUiPostCard = (post) => ({
  id: post.id,
  slug: post.slug,
  title: post.title,
  excerpt: post.excerpt,
  coverImage: post.coverImage || null,
  readingTime: calculateReadingTime(post.content || post.excerpt || ''),
  featured: post.featured,
  author: post.author || null,
  publishedAt: post.publishedAt,
  updatedAt: post.updatedAt,
  createdAt: post.createdAt,
  category: post.category
    ? { slug: post.category.slug, name: post.category.name }
    : null,
  tags: post.tags
    ? post.tags.map((t) => ({ slug: t.tag.slug, name: t.tag.name }))
    : [],
});

/**
 * Maps an API post response to the UI detail shape.
 * @param {object} post - API post.
 * @returns {object} UI post detail.
 */
export const toUiPostDetail = (post) => ({
  id: post.id,
  slug: post.slug,
  title: post.title,
  excerpt: post.excerpt,
  content: post.content,
  coverImage: post.coverImage || null,
  readingTime: calculateReadingTime(post.content || post.excerpt || ''),
  featured: post.featured,
  author: post.author || null,
  publishedAt: post.publishedAt,
  updatedAt: post.updatedAt,
  createdAt: post.createdAt,
  seoTitle: post.seoTitle || null,
  seoDescription: post.seoDescription || null,
  canonicalUrl: post.canonicalUrl || null,
  category: post.category
    ? { slug: post.category.slug, name: post.category.name }
    : null,
  tags: post.tags
    ? post.tags.map((t) => ({ slug: t.tag.slug, name: t.tag.name }))
    : [],
});

/**
 * Fetches blog posts with pagination, search, category, and tag filtering.
 * @param {object} [query] - Query parameters.
 * @param {number} [query.page=1]
 * @param {number} [query.limit=10]
 * @param {string} [query.search]
 * @param {string} [query.category]
 * @param {string} [query.tag]
 * @param {boolean} [query.featured]
 * @param {AbortSignal} [signal]
 * @returns {Promise<{posts: Array, pagination: object}>}
 */
export async function fetchBlogPosts(query = {}, signal) {
  const params = { ...query };
  Object.keys(params).forEach((key) => {
    if (
      params[key] === undefined ||
      params[key] === null ||
      params[key] === ''
    ) {
      delete params[key];
    }
  });

  const response = await apiClient.get('/blog/posts', { params, signal });

  const meta = response.meta || {};
  const posts = (response.data || []).map(toUiPostCard);

  return {
    posts,
    pagination: {
      page: meta.page || 1,
      limit: meta.limit || 10,
      total: meta.total || 0,
      totalPages: meta.totalPages || 0,
      hasNext: meta.hasNext || false,
      hasPrevious: meta.hasPrevious || false,
    },
  };
}

/**
 * Fetches a single blog post by slug.
 * @param {string} slug - Post slug.
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>} Full post object (UI shape).
 */
export async function fetchBlogPost(slug, signal) {
  const response = await apiClient.get(`/blog/posts/${slug}`, { signal });
  return toUiPostDetail(response.data);
}

/**
 * Fetches featured blog posts.
 * @param {number} [limit=3]
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array>} Featured posts (UI shape).
 */
export async function fetchFeaturedPosts(limit = 3, signal) {
  const response = await apiClient.get(`/blog/featured?limit=${limit}`, {
    signal,
  });
  return (response.data || []).map(toUiPostCard);
}

/**
 * Fetches all categories.
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array>} Categories.
 */
export async function fetchBlogCategories(signal) {
  const response = await apiClient.get('/blog/categories', { signal });
  return response.data || [];
}

/**
 * Fetches all tags.
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array>} Tags.
 */
export async function fetchBlogTags(signal) {
  const response = await apiClient.get('/blog/tags', { signal });
  return response.data || [];
}

/**
 * Fetches posts filtered by category slug with pagination.
 * @param {string} slug - Category slug.
 * @param {object} [query] - Pagination query.
 * @param {AbortSignal} [signal]
 * @returns {Promise<{posts: Array, pagination: object, category: object}>}
 */
export async function fetchPostsByCategory(slug, query = {}, signal) {
  const params = { ...query };
  Object.keys(params).forEach((key) => {
    if (
      params[key] === undefined ||
      params[key] === null ||
      params[key] === ''
    ) {
      delete params[key];
    }
  });

  const response = await apiClient.get(`/blog/categories/${slug}/posts`, {
    params,
    signal,
  });

  const { data, meta } = response;
  const posts = (data || []).map(toUiPostCard);

  return {
    posts,
    category: meta.category || null,
    pagination: {
      page: meta.page || 1,
      limit: meta.limit || 10,
      total: meta.total || 0,
      totalPages: meta.totalPages || 0,
      hasNext: meta.hasNext || false,
      hasPrevious: meta.hasPrevious || false,
    },
  };
}

/**
 * Fetches posts filtered by tag slug with pagination.
 * @param {string} slug - Tag slug.
 * @param {object} [query] - Pagination query.
 * @param {AbortSignal} [signal]
 * @returns {Promise<{posts: Array, pagination: object, tag: object}>}
 */
export async function fetchPostsByTag(slug, query = {}, signal) {
  const params = { ...query };
  Object.keys(params).forEach((key) => {
    if (
      params[key] === undefined ||
      params[key] === null ||
      params[key] === ''
    ) {
      delete params[key];
    }
  });

  const response = await apiClient.get(`/blog/tags/${slug}/posts`, {
    params,
    signal,
  });

  const { data, meta } = response;
  const posts = (data || []).map(toUiPostCard);

  return {
    posts,
    tag: meta.tag || null,
    pagination: {
      page: meta.page || 1,
      limit: meta.limit || 10,
      total: meta.total || 0,
      totalPages: meta.totalPages || 0,
      hasNext: meta.hasNext || false,
      hasPrevious: meta.hasPrevious || false,
    },
  };
}

/**
 * Fetches all published blog slugs + lastmod for sitemap generation.
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array<{slug: string, lastmod: string}>>}
 */
export async function fetchBlogSitemapData(signal) {
  const response = await apiClient.get('/blog/sitemap', { signal });
  return response.data || [];
}
