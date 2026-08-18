import prisma from '../lib/prisma.js';
import logger from '../utils/logger.js';

/**
 * Blog repository — direct Prisma queries for blog entities.
 * Public methods return only published data; admin methods accept
 * any status.
 */

// ---------------------------------------------------------------------------
// Slug helpers
// ---------------------------------------------------------------------------
const BLOG_POST_SELECT_FIELDS = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  content: true,
  coverImage: true,
  status: true,
  publishedAt: true,
  author: true,
  featured: true,
  seoTitle: true,
  seoDescription: true,
  canonicalUrl: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: { id: true, slug: true, name: true },
  },
  tags: {
    select: {
      tag: {
        select: { id: true, slug: true, name: true },
      },
    },
  },
};

const BLOG_POST_CARD_FIELDS = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImage: true,
  status: true,
  publishedAt: true,
  author: true,
  featured: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: { id: true, slug: true, name: true },
  },
  tags: {
    select: {
      tag: {
        select: { id: true, slug: true, name: true },
      },
    },
  },
};

/**
 * Builds a Prisma where-clause fragment for published posts.
 */
const publishedWhere = {
  status: 'PUBLISHED',
  publishedAt: { not: null, lte: new Date() },
};

/**
 * Computes the total count of posts matching the given where clause.
 * @param {object} where - Prisma where clause.
 * @returns {Promise<number>} Count.
 */
export const countPosts = async (where = {}) => {
  try {
    return await prisma.blogPost.count({ where });
  } catch (err) {
    logger.error('countPosts failed', { error: err.message });
    throw err;
  }
};

/**
 * Finds published blog posts with pagination, search, category, and tag filtering.
 * @param {object} options
 * @param {number} options.page - Page number (1-based).
 * @param {number} options.limit - Items per page.
 * @param {string} [options.search] - Search term.
 * @param {string} [options.category] - Category slug.
 * @param {string} [options.tag] - Tag slug.
 * @param {boolean} [options.featured] - Filter to featured posts only.
 * @returns {Promise<{items: Array, total: number, page: number, limit: number}>}
 */
export const findPublishedPosts = async ({
  page = 1,
  limit = 10,
  search = null,
  category = null,
  tag = null,
  featured = null,
} = {}) => {
  try {
    const take = Math.min(Math.max(limit, 1), 50);
    const skip = (Math.max(page, 1) - 1) * take;

    const where = {
      ...publishedWhere,
      ...(featured === true ? { featured: true } : {}),
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        {
          tags: {
            some: {
              tag: { name: { contains: search, mode: 'insensitive' } },
            },
          },
        },
        {
          tags: {
            some: {
              tag: { slug: { contains: search, mode: 'insensitive' } },
            },
          },
        },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (tag) {
      where.tags = {
        some: {
          tag: { slug: tag },
        },
      };
    }

    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        select: BLOG_POST_CARD_FIELDS,
        orderBy: [
          { featured: 'desc' },
          { publishedAt: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return {
      items,
      total,
      page: Math.max(page, 1),
      limit: take,
    };
  } catch (err) {
    logger.error('findPublishedPosts failed', { error: err.message });
    throw err;
  }
};

/**
 * Finds a single published post by slug.
 * @param {string} slug - Post slug.
 * @returns {Promise<object|null>} Post or null.
 */
export const findPublishedPostBySlug = async (slug) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: BLOG_POST_SELECT_FIELDS,
    });

    if (!post || post.status !== 'PUBLISHED' || !post.publishedAt) {
      return null;
    }

    return post;
  } catch (err) {
    logger.error('findPublishedPostBySlug failed', {
      error: err.message,
      slug,
    });
    throw err;
  }
};

/**
 * Finds a post by id (admin — any status).
 * @param {string} id - Post id.
 * @returns {Promise<object|null>} Post.
 */
export const findPostById = async (id) => {
  try {
    return await prisma.blogPost.findUnique({
      where: { id },
      select: BLOG_POST_SELECT_FIELDS,
    });
  } catch (err) {
    logger.error('findPostById failed', { error: err.message, id });
    throw err;
  }
};

/**
 * Finds post by slug for admin (any status).
 * @param {string} slug - Post slug.
 * @returns {Promise<object|null>} Post.
 */
export const findPostBySlugAdmin = async (slug) => {
  try {
    return await prisma.blogPost.findUnique({
      where: { slug },
      select: BLOG_POST_SELECT_FIELDS,
    });
  } catch (err) {
    logger.error('findPostBySlugAdmin failed', { error: err.message, slug });
    throw err;
  }
};

/**
 * Finds featured published posts.
 * @param {number} [limit=3] - Maximum posts.
 * @returns {Promise<Array>} Featured posts.
 */
export const findFeaturedPosts = async (limit = 3) => {
  try {
    return await prisma.blogPost.findMany({
      where: publishedWhere,
      select: BLOG_POST_CARD_FIELDS,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });
  } catch (err) {
    logger.error('findFeaturedPosts failed', { error: err.message });
    throw err;
  }
};

/**
 * Finds related posts based on shared category and tags.
 * Excludes the given post id.
 * @param {string} postId - Current post id to exclude.
 * @param {string|null} categoryId - Category id.
 * @param {Array<string>} tagIds - Tag ids.
 * @param {number} [limit=3] - Maximum posts.
 * @returns {Promise<Array>} Related posts.
 */
export const findRelatedPosts = async (
  postId,
  categoryId,
  tagIds = [],
  limit = 3,
) => {
  try {
    const where = {
      ...publishedWhere,
      id: { not: postId },
      OR: [],
    };

    if (categoryId) {
      where.OR.push({ categoryId });
    }

    if (tagIds.length > 0) {
      where.OR.push({
        tags: { some: { tagId: { in: tagIds } } },
      });
    }

    if (where.OR.length === 0) {
      delete where.OR;
      where.id = { not: postId };
    }

    return await prisma.blogPost.findMany({
      where,
      select: BLOG_POST_CARD_FIELDS,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });
  } catch (err) {
    logger.error('findRelatedPosts failed', { error: err.message, postId });
    throw err;
  }
};

/**
 * Finds all published posts for RSS feed.
 * @param {number} [limit=50] - Maximum posts.
 * @returns {Promise<Array>} Published posts.
 */
export const findAllPublishedForFeed = async (limit = 50) => {
  try {
    return await prisma.blogPost.findMany({
      where: publishedWhere,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        publishedAt: true,
        author: true,
        updatedAt: true,
        category: {
          select: { name: true, slug: true },
        },
        tags: {
          select: {
            tag: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
  } catch (err) {
    logger.error('findAllPublishedForFeed failed', { error: err.message });
    throw err;
  }
};

/**
 * Finds all published slugs for sitemap.
 * @returns {Promise<Array<{slug: string, updatedAt: Date}>>} Published slugs.
 */
export const findAllPublishedSlugs = async () => {
  try {
    return await prisma.blogPost.findMany({
      where: publishedWhere,
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
    });
  } catch (err) {
    logger.error('findAllPublishedSlugs failed', { error: err.message });
    throw err;
  }
};

/**
 * Finds published posts filtered by category slug with pagination.
 * @param {string} categorySlug - Category slug.
 * @param {object} options - Pagination options.
 * @param {number} options.page
 * @param {number} options.limit
 * @returns {Promise<{items: Array, total: number, page: number, limit: number}>}
 */
export const findPublishedPostsByCategory = async (
  categorySlug,
  { page = 1, limit = 10 } = {},
) => {
  try {
    const take = Math.min(Math.max(limit, 1), 50);
    const skip = (Math.max(page, 1) - 1) * take;

    const category = await prisma.blogCategory.findUnique({
      where: { slug: categorySlug },
      select: { id: true, name: true, slug: true, description: true },
    });

    if (!category) {
      return { items: [], total: 0, page: Math.max(page, 1), limit: take };
    }

    const where = {
      ...publishedWhere,
      categoryId: category.id,
    };

    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        select: BLOG_POST_CARD_FIELDS,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return {
      items,
      total,
      page: Math.max(page, 1),
      limit: take,
      category,
    };
  } catch (err) {
    logger.error('findPublishedPostsByCategory failed', {
      error: err.message,
      categorySlug,
    });
    throw err;
  }
};

/**
 * Finds published posts filtered by tag slug with pagination.
 * @param {string} tagSlug - Tag slug.
 * @param {object} options - Pagination options.
 * @param {number} options.page
 * @param {number} options.limit
 * @returns {Promise<{items: Array, total: number, page: number, limit: number}>}
 */
export const findPublishedPostsByTag = async (
  tagSlug,
  { page = 1, limit = 10 } = {},
) => {
  try {
    const take = Math.min(Math.max(limit, 1), 50);
    const skip = (Math.max(page, 1) - 1) * take;

    const tag = await prisma.blogTag.findUnique({
      where: { slug: tagSlug },
      select: { id: true, name: true, slug: true },
    });

    if (!tag) {
      return { items: [], total: 0, page: Math.max(page, 1), limit: take };
    }

    const where = {
      ...publishedWhere,
      tags: { some: { tagId: tag.id } },
    };

    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        select: BLOG_POST_CARD_FIELDS,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return {
      items,
      total,
      page: Math.max(page, 1),
      limit: take,
      tag,
    };
  } catch (err) {
    logger.error('findPublishedPostsByTag failed', {
      error: err.message,
      tagSlug,
    });
    throw err;
  }
};

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export const findCategories = async () => {
  try {
    return await prisma.blogCategory.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, slug: true, name: true, description: true },
    });
  } catch (err) {
    logger.error('findCategories failed', { error: err.message });
    throw err;
  }
};

export const findCategoryBySlug = async (slug) => {
  try {
    return await prisma.blogCategory.findUnique({
      where: { slug },
      select: { id: true, slug: true, name: true, description: true },
    });
  } catch (err) {
    logger.error('findCategoryBySlug failed', { error: err.message, slug });
    throw err;
  }
};

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------
export const findTags = async () => {
  try {
    return await prisma.blogTag.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, slug: true, name: true },
    });
  } catch (err) {
    logger.error('findTags failed', { error: err.message });
    throw err;
  }
};

export const findTagBySlug = async (slug) => {
  try {
    return await prisma.blogTag.findUnique({
      where: { slug },
      select: { id: true, slug: true, name: true },
    });
  } catch (err) {
    logger.error('findTagBySlug failed', { error: err.message, slug });
    throw err;
  }
};

// ---------------------------------------------------------------------------
// Admin CRUD operations
// ---------------------------------------------------------------------------
export const findAllPostsAdmin = async () => {
  try {
    const posts = await prisma.blogPost.findMany({
      select: {
        ...BLOG_POST_CARD_FIELDS,
        _count: { select: { tags: true } },
      },
    });
    // Prisma does not support conditional/computed ordering on enum fields.
    // Sort in JS to keep drafts/unpublished first, then by featured, dates.
    posts.sort((a, b) => {
      const aUnpublished = a.status !== 'PUBLISHED';
      const bUnpublished = b.status !== 'PUBLISHED';
      if (aUnpublished !== bUnpublished) return aUnpublished ? -1 : 1;
      if (b.featured !== a.featured) return b.featured - a.featured;
      const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      if (aDate !== bDate) return bDate - aDate;
      const aCreated = new Date(a.createdAt).getTime();
      const bCreated = new Date(b.createdAt).getTime();
      return bCreated - aCreated;
    });
    return posts;
  } catch (err) {
    logger.error('findAllPostsAdmin failed', { error: err.message });
    throw err;
  }
};

export const createPostAdmin = async (data) => {
  try {
    const { tagIds, categoryId, ...rest } = data;
    return await prisma.blogPost.create({
      data: {
        ...rest,
        status: rest.status || 'DRAFT',
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
        ...(tagIds && tagIds.length > 0
          ? {
              tags: {
                create: tagIds.map((tagId) => ({
                  tag: { connect: { id: tagId } },
                })),
              },
            }
          : {}),
      },
      select: BLOG_POST_SELECT_FIELDS,
    });
  } catch (err) {
    logger.error('createPostAdmin failed', { error: err.message });
    throw err;
  }
};

export const updatePostAdmin = async (id, data) => {
  try {
    const { tagIds, categoryId, ...rest } = data;
    return await prisma.blogPost.update({
      where: { id },
      data: {
        ...rest,
        ...(categoryId !== undefined
          ? categoryId
            ? { category: { connect: { id: categoryId } } }
            : { category: { disconnect: true } }
          : {}),
        ...(tagIds
          ? {
              tags: {
                deleteMany: {},
                create: tagIds.map((tagId) => ({
                  tag: { connect: { id: tagId } },
                })),
              },
            }
          : {}),
      },
      select: BLOG_POST_SELECT_FIELDS,
    });
  } catch (err) {
    logger.error('updatePostAdmin failed', { error: err.message, id });
    throw err;
  }
};

export const deletePostAdmin = async (id) => {
  try {
    return await prisma.blogPost.delete({ where: { id } });
  } catch (err) {
    logger.error('deletePostAdmin failed', { error: err.message, id });
    throw err;
  }
};

// --- Categories ---
export const createCategoryAdmin = async (data) => {
  try {
    return await prisma.blogCategory.create({ data });
  } catch (err) {
    logger.error('createCategoryAdmin failed', { error: err.message });
    throw err;
  }
};

export const updateCategoryAdmin = async (id, data) => {
  try {
    return await prisma.blogCategory.update({ where: { id }, data });
  } catch (err) {
    logger.error('updateCategoryAdmin failed', { error: err.message, id });
    throw err;
  }
};

export const deleteCategoryAdmin = async (id) => {
  try {
    return await prisma.blogCategory.delete({ where: { id } });
  } catch (err) {
    logger.error('deleteCategoryAdmin failed', { error: err.message, id });
    throw err;
  }
};

// --- Tags ---
export const createTagAdmin = async (data) => {
  try {
    return await prisma.blogTag.create({ data });
  } catch (err) {
    logger.error('createTagAdmin failed', { error: err.message });
    throw err;
  }
};

export const updateTagAdmin = async (id, data) => {
  try {
    return await prisma.blogTag.update({ where: { id }, data });
  } catch (err) {
    logger.error('updateTagAdmin failed', { error: err.message, id });
    throw err;
  }
};

export const deleteTagAdmin = async (id) => {
  try {
    return await prisma.blogTag.delete({ where: { id } });
  } catch (err) {
    logger.error('deleteTagAdmin failed', { error: err.message, id });
    throw err;
  }
};

export const blogRepository = {
  findPublishedPosts,
  findPublishedPostBySlug,
  findPostById,
  findPostBySlugAdmin,
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
};

export default blogRepository;
