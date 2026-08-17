import {
  blogRepository,
  findPublishedPosts,
  findPublishedPostBySlug,
  findPostById,
  findFeaturedPosts,
  findRelatedPosts,
  findAllPublishedForFeed,
  findAllPublishedSlugs,
  findPublishedPostsByCategory,
  findPublishedPostsByTag,
  findCategories,
  findCategoryBySlug,
  findTags,
  findTagBySlug,
  findAllPostsAdmin,
  createPostAdmin,
  updatePostAdmin,
  deletePostAdmin,
  createCategoryAdmin,
  updateCategoryAdmin,
  deleteCategoryAdmin,
  createTagAdmin,
  updateTagAdmin,
  deleteTagAdmin,
} from '../repositories/blogRepository.js';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';

const WORDS_PER_MINUTE = 200;

/**
 * Calculates estimated reading time from Markdown content.
 * Strips Markdown syntax to get plain word count.
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
 * Generates a URL-safe slug from a title.
 * @param {string} title - Post title.
 * @returns {string} URL-safe slug.
 */
export const generateSlug = (title) => {
  if (!title || typeof title !== 'string') return '';

  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\w]+/g, (word) => word)
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Maps a database post to the public API shape.
 * Adds calculated readingTime, strips sensitive fields.
 * @param {object} post - Raw Prisma post.
 * @returns {object} Public post object.
 */
const mapPostToPublic = (post) => {
  if (!post) return null;

  const readingTime = calculateReadingTime(post.content || post.excerpt || '');

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage || null,
    status: post.status,
    publishedAt: post.publishedAt,
    author: post.author || null,
    readingTime,
    featured: post.featured,
    seoTitle: post.seoTitle || null,
    seoDescription: post.seoDescription || null,
    canonicalUrl: post.canonicalUrl || null,
    category: post.category
      ? {
          id: post.category.id,
          slug: post.category.slug,
          name: post.category.name,
        }
      : null,
    tags: post.tags
      ? post.tags.map((t) => ({
          id: t.tag.id,
          slug: t.tag.slug,
          name: t.tag.name,
        }))
      : [],
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

/**
 * Maps a database post to the admin API shape (includes all fields).
 * @param {object} post - Raw Prisma post.
 * @returns {object} Admin post object.
 */
const mapPostToAdmin = (post) => {
  if (!post) return null;

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage || null,
    status: post.status,
    publishedAt: post.publishedAt,
    author: post.author || null,
    featured: post.featured,
    seoTitle: post.seoTitle || null,
    seoDescription: post.seoDescription || null,
    canonicalUrl: post.canonicalUrl || null,
    categoryId: post.category?.id || null,
    category: post.category
      ? {
          id: post.category.id,
          slug: post.category.slug,
          name: post.category.name,
        }
      : null,
    tags: post.tags
      ? post.tags.map((t) => ({
          id: t.tag.id,
          slug: t.tag.slug,
          name: t.tag.name,
        }))
      : [],
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

// ---------------------------------------------------------------------------
// Public blog services
// ---------------------------------------------------------------------------

/**
 * Fetches paginated, filtered, searched published posts.
 * @param {object} query
 * @param {number} [query.page=1]
 * @param {number} [query.limit=10]
 * @param {string} [query.search]
 * @param {string} [query.category]
 * @param {string} [query.tag]
 * @param {boolean} [query.featured]
 * @returns {Promise<{posts: Array, pagination: object}>}
 */
export const getPosts = async (query = {}) => {
  try {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 50);

    const result = await findPublishedPosts({
      page,
      limit,
      search: query.search || null,
      category: query.category || null,
      tag: query.tag || null,
      featured:
        query.featured === 'true' || query.featured === true ? true : null,
    });

    const totalPages = Math.ceil(result.total / result.limit) || 1;

    return {
      posts: result.items.map(mapPostToPublic),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages,
        hasNext: result.page < totalPages,
        hasPrevious: result.page > 1,
      },
    };
  } catch (err) {
    logger.error('getPosts failed', { error: err.message, query });
    throw err;
  }
};

/**
 * Fetches a single published post by slug.
 * @param {string} slug - Post slug.
 * @returns {Promise<object|null>} Post or null.
 */
export const getPostBySlug = async (slug) => {
  try {
    const post = await findPublishedPostBySlug(slug);
    return mapPostToPublic(post);
  } catch (err) {
    logger.error('getPostBySlug failed', { error: err.message, slug });
    throw err;
  }
};

/**
 * Fetches featured posts.
 * @param {number} [limit=3]
 * @returns {Promise<Array>} Featured posts.
 */
export const getFeaturedPosts = async (limit = 3) => {
  try {
    const posts = await findFeaturedPosts(limit);
    return posts.map(mapPostToPublic);
  } catch (err) {
    logger.error('getFeaturedPosts failed', { error: err.message });
    throw err;
  }
};

/**
 * Fetches related posts for a given post.
 * @param {string} postId
 * @param {string|null} categoryId
 * @param {Array<string>} tagIds
 * @param {number} [limit=3]
 * @returns {Promise<Array>} Related posts.
 */
export const getRelatedPosts = async (
  postId,
  categoryId,
  tagIds = [],
  limit = 3,
) => {
  try {
    const posts = await findRelatedPosts(postId, categoryId, tagIds, limit);
    return posts.map(mapPostToPublic);
  } catch (err) {
    logger.error('getRelatedPosts failed', { error: err.message, postId });
    throw err;
  }
};

/**
 * Fetches all categories.
 * @returns {Promise<Array>} Categories.
 */
export const getCategories = async () => {
  try {
    return await findCategories();
  } catch (err) {
    logger.error('getCategories failed', { error: err.message });
    throw err;
  }
};

/**
 * Fetches all tags.
 * @returns {Promise<Array>} Tags.
 */
export const getTags = async () => {
  try {
    return await findTags();
  } catch (err) {
    logger.error('getTags failed', { error: err.message });
    throw err;
  }
};

/**
 * Fetches a category by slug.
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
export const getCategoryBySlug = async (slug) => {
  try {
    return await findCategoryBySlug(slug);
  } catch (err) {
    logger.error('getCategoryBySlug failed', { error: err.message, slug });
    throw err;
  }
};

/**
 * Fetches a tag by slug.
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
export const getTagBySlug = async (slug) => {
  try {
    return await findTagBySlug(slug);
  } catch (err) {
    logger.error('getTagBySlug failed', { error: err.message, slug });
    throw err;
  }
};

/**
 * Fetches posts filtered by category slug with pagination.
 * @param {string} categorySlug
 * @param {object} query
 * @returns {Promise<{posts: Array, pagination: object, category: object}>}
 */
export const getPostsByCategory = async (categorySlug, query = {}) => {
  try {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 50);

    const result = await findPublishedPostsByCategory(categorySlug, {
      page,
      limit,
    });

    const totalPages = Math.ceil(result.total / result.limit) || 1;

    return {
      posts: result.items.map(mapPostToPublic),
      category: result.category || null,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages,
        hasNext: result.page < totalPages,
        hasPrevious: result.page > 1,
      },
    };
  } catch (err) {
    logger.error('getPostsByCategory failed', {
      error: err.message,
      categorySlug,
    });
    throw err;
  }
};

/**
 * Fetches posts filtered by tag slug with pagination.
 * @param {string} tagSlug
 * @param {object} query
 * @returns {Promise<{posts: Array, pagination: object, tag: object}>}
 */
export const getPostsByTag = async (tagSlug, query = {}) => {
  try {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 50);

    const result = await findPublishedPostsByTag(tagSlug, { page, limit });

    const totalPages = Math.ceil(result.total / result.limit) || 1;

    return {
      posts: result.items.map(mapPostToPublic),
      tag: result.tag || null,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages,
        hasNext: result.page < totalPages,
        hasPrevious: result.page > 1,
      },
    };
  } catch (err) {
    logger.error('getPostsByTag failed', { error: err.message, tagSlug });
    throw err;
  }
};

/**
 * Fetches all published posts for RSS feed.
 * @param {number} [limit=50]
 * @returns {Promise<Array>}
 */
export const getAllPublishedForFeed = async (limit = 50) => {
  try {
    return await findAllPublishedForFeed(limit);
  } catch (err) {
    logger.error('getAllPublishedForFeed failed', { error: err.message });
    throw err;
  }
};

/**
 * Fetches all published slugs for sitemap.
 * @returns {Promise<Array<{slug, updatedAt}>>}
 */
export const getAllPublishedSlugs = async () => {
  try {
    return await findAllPublishedSlugs();
  } catch (err) {
    logger.error('getAllPublishedSlugs failed', { error: err.message });
    throw err;
  }
};

// ---------------------------------------------------------------------------
// Admin blog services
// ---------------------------------------------------------------------------

/**
 * Fetches all posts for admin (any status).
 * @returns {Promise<Array>}
 */
export const listAllPostsAdmin = async () => {
  try {
    return await findAllPostsAdmin();
  } catch (err) {
    logger.error('listAllPostsAdmin failed', { error: err.message });
    throw err;
  }
};

/**
 * Fetches a single post by id for admin.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export const getPostAdmin = async (id) => {
  try {
    const post = await findPostById(id);
    return mapPostToAdmin(post);
  } catch (err) {
    logger.error('getPostAdmin failed', { error: err.message, id });
    throw err;
  }
};

/**
 * Fetches a post by slug for admin (any status).
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
export const getPostBySlugAdmin = async (slug) => {
  try {
    const post = await findPublishedPostBySlug(slug);
    return mapPostToAdmin(post);
  } catch (err) {
    logger.error('getPostBySlugAdmin failed', { error: err.message, slug });
    throw err;
  }
};

/**
 * Checks if a post with the given slug already exists (excluding a post id).
 * @param {string} slug
 * @param {string} [excludeId]
 * @returns {Promise<boolean>}
 */
export const slugExists = async (slug, excludeId = null) => {
  try {
    const post = await blogRepository.findPostBySlugAdmin(slug);
    if (!post) return false;
    return excludeId ? post.id !== excludeId : true;
  } catch (err) {
    logger.error('slugExists failed', { error: err.message, slug });
    throw err;
  }
};

/**
 * Creates a new blog post.
 * @param {object} data - Post data.
 * @param {string} data.title
 * @param {string} data.slug
 * @param {string} [data.excerpt]
 * @param {string} data.content
 * @param {string} [data.coverImage]
 * @param {string} [data.status]
 * @param {string} [data.author]
 * @param {boolean} [data.featured]
 * @param {string} [data.seoTitle]
 * @param {string} [data.seoDescription]
 * @param {string} [data.canonicalUrl]
 * @param {string} [data.categoryId]
 * @param {Array<string>} [data.tagIds]
 * @returns {Promise<object>} Created post.
 */
export const createPost = async (data) => {
  try {
    const post = await createPostAdmin({
      ...data,
      publishedAt:
        data.status === 'PUBLISHED' && !data.publishedAt
          ? new Date()
          : data.publishedAt || null,
    });
    return mapPostToAdmin(post);
  } catch (err) {
    logger.error('createPost failed', { error: err.message });
    throw err;
  }
};

/**
 * Updates a blog post.
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object>} Updated post.
 */
export const updatePost = async (id, data) => {
  try {
    const needsPublish = data.status === 'PUBLISHED' && !data.publishedAt;

    const payload = {
      ...data,
      ...(needsPublish ? { publishedAt: new Date() } : {}),
    };

    const post = await updatePostAdmin(id, payload);
    return mapPostToAdmin(post);
  } catch (err) {
    logger.error('updatePost failed', { error: err.message, id });
    throw err;
  }
};

/**
 * Deletes a blog post.
 * @param {string} id
 * @returns {Promise<void>}
 */
export const deletePost = async (id) => {
  try {
    await deletePostAdmin(id);
  } catch (err) {
    logger.error('deletePost failed', { error: err.message, id });
    throw err;
  }
};

/**
 * Lists all categories for admin.
 * @returns {Promise<Array>}
 */
export const listCategoriesAdmin = async () => {
  try {
    return await findCategories();
  } catch (err) {
    logger.error('listCategoriesAdmin failed', { error: err.message });
    throw err;
  }
};

/**
 * Creates a category.
 * @param {object} data
 * @returns {Promise<object>}
 */
export const createCategory = async (data) => {
  try {
    return await createCategoryAdmin(data);
  } catch (err) {
    logger.error('createCategory failed', { error: err.message });
    throw err;
  }
};

/**
 * Updates a category.
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object>}
 */
export const updateCategory = async (id, data) => {
  try {
    return await updateCategoryAdmin(id, data);
  } catch (err) {
    logger.error('updateCategory failed', { error: err.message, id });
    throw err;
  }
};

/**
 * Deletes a category.
 * @param {string} id
 * @returns {Promise<void>}
 */
export const deleteCategory = async (id) => {
  try {
    await deleteCategoryAdmin(id);
  } catch (err) {
    logger.error('deleteCategory failed', { error: err.message, id });
    throw err;
  }
};

/**
 * Lists all tags for admin.
 * @returns {Promise<Array>}
 */
export const listTagsAdmin = async () => {
  try {
    return await findTags();
  } catch (err) {
    logger.error('listTagsAdmin failed', { error: err.message });
    throw err;
  }
};

/**
 * Creates a tag.
 * @param {object} data
 * @returns {Promise<object>}
 */
export const createTag = async (data) => {
  try {
    return await createTagAdmin(data);
  } catch (err) {
    logger.error('createTag failed', { error: err.message });
    throw err;
  }
};

/**
 * Updates a tag.
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object>}
 */
export const updateTag = async (id, data) => {
  try {
    return await updateTagAdmin(id, data);
  } catch (err) {
    logger.error('updateTag failed', { error: err.message, id });
    throw err;
  }
};

/**
 * Deletes a tag.
 * @param {string} id
 * @returns {Promise<void>}
 */
export const deleteTag = async (id) => {
  try {
    await deleteTagAdmin(id);
  } catch (err) {
    logger.error('deleteTag failed', { error: err.message, id });
    throw err;
  }
};

/**
 * Returns the canonical site URL from environment configuration.
 * @returns {string}
 */
export const getSiteUrl = () => env.frontendUrl || 'http://localhost:5173';

const blogService = {
  calculateReadingTime,
  generateSlug,
  getPosts,
  getPostBySlug,
  getFeaturedPosts,
  getRelatedPosts,
  getCategories,
  getTags,
  getCategoryBySlug,
  getTagBySlug,
  getPostsByCategory,
  getPostsByTag,
  getAllPublishedForFeed,
  getAllPublishedSlugs,
  listAllPostsAdmin,
  getPostAdmin,
  getPostBySlugAdmin,
  slugExists,
  createPost,
  updatePost,
  deletePost,
  listCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  listTagsAdmin,
  createTag,
  updateTag,
  deleteTag,
  getSiteUrl,
};

export default blogService;
