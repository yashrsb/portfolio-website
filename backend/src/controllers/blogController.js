import blogService from '../services/blogService.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { MESSAGES } from '../constants/messages.js';
import { buildFeed } from '../utils/rss.js';

const buildMeta = (req) => ({
  timestamp: new Date().toISOString(),
  requestId: req.id,
});

// ---------------------------------------------------------------------------
// Public blog endpoints
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/blog/posts
 * Returns paginated, searchable, filterable published posts.
 */
export const listPostsHandler = asyncHandler(async (req, res) => {
  const { posts, pagination } = await blogService.getPosts(req.query);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: MESSAGES.RESOURCE_FETCHED,
    data: posts,
    meta: {
      ...pagination,
      timestamp: new Date().toISOString(),
      requestId: req.id,
    },
  });
});

/**
 * GET /api/v1/blog/posts/:slug
 * Returns a single published post.
 */
export const getPostHandler = asyncHandler(async (req, res) => {
  const post = await blogService.getPostBySlug(req.params.slug);
  if (!post) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'Blog post not found',
      'NOT_FOUND',
    );
  }
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    post,
    buildMeta(req),
  ).send(res);
});

/**
 * GET /api/v1/blog/featured
 * Returns featured published posts.
 */
export const getFeaturedPostsHandler = asyncHandler(async (req, res) => {
  const posts = await blogService.getFeaturedPosts(
    parseInt(req.query.limit, 10) || 3,
  );
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    posts,
    buildMeta(req),
  ).send(res);
});

/**
 * GET /api/v1/blog/categories
 * Returns all categories.
 */
export const getCategoriesHandler = asyncHandler(async (req, res) => {
  const categories = await blogService.getCategories();
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    categories,
    buildMeta(req),
  ).send(res);
});

/**
 * GET /api/v1/blog/categories/:slug/posts
 * Returns posts in a specific category.
 */
export const getCategoryPostsHandler = asyncHandler(async (req, res) => {
  const result = await blogService.getPostsByCategory(
    req.params.slug,
    req.query,
  );
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: MESSAGES.RESOURCE_FETCHED,
    data: result.posts,
    meta: {
      ...result.pagination,
      category: result.category,
      timestamp: new Date().toISOString(),
      requestId: req.id,
    },
  });
});

/**
 * GET /api/v1/blog/tags
 * Returns all tags.
 */
export const getTagsHandler = asyncHandler(async (req, res) => {
  const tags = await blogService.getTags();
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    tags,
    buildMeta(req),
  ).send(res);
});

/**
 * GET /api/v1/blog/tags/:slug/posts
 * Returns posts with a specific tag.
 */
export const getTagPostsHandler = asyncHandler(async (req, res) => {
  const result = await blogService.getPostsByTag(req.params.slug, req.query);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: MESSAGES.RESOURCE_FETCHED,
    data: result.posts,
    meta: {
      ...result.pagination,
      tag: result.tag,
      timestamp: new Date().toISOString(),
      requestId: req.id,
    },
  });
});

/**
 * GET /rss.xml
 * Returns RSS 2.0 feed of published posts.
 */
export const getRssHandler = asyncHandler(async (req, res) => {
  const posts = await blogService.getAllPublishedForFeed(50);
  const feed = buildFeed(posts);

  res.set({
    'Content-Type': 'application/rss+xml; charset=utf-8',
    'Cache-Control': 's-maxage=300, stale-while-revalidate=60',
  });
  res.status(HTTP_STATUS.OK).send(feed);
});

/**
 * GET /api/v1/blog/sitemap
 * Returns JSON list of all published blog post slugs + lastmod.
 */
export const getSitemapHandler = asyncHandler(async (req, res) => {
  const slugs = await blogService.getAllPublishedSlugs();
  const urls = slugs.map((p) => ({
    slug: p.slug,
    lastmod: (p.publishedAt || p.updatedAt).toISOString(),
  }));
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    urls,
    buildMeta(req),
  ).send(res);
});

// ---------------------------------------------------------------------------
// Admin blog endpoints
// ---------------------------------------------------------------------------

/**
 * GET /admin/blog/posts
 * Returns all posts (admin, any status).
 */
export const listBlogPostsAdminHandler = asyncHandler(async (req, res) => {
  const posts = await blogService.listAllPostsAdmin();
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    posts,
    buildMeta(req),
  ).send(res);
});

/**
 * GET /admin/blog/posts/:id
 */
export const getBlogPostAdminHandler = asyncHandler(async (req, res) => {
  const post = await blogService.getPostAdmin(req.params.id);
  if (!post) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'Blog post not found',
      'NOT_FOUND',
    );
  }
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    post,
    buildMeta(req),
  ).send(res);
});

/**
 * POST /admin/blog/posts
 */
export const createBlogPostHandler = asyncHandler(async (req, res) => {
  if (req.body.slug) {
    const exists = await blogService.slugExists(req.body.slug);
    if (exists) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        'A blog post with this slug already exists.',
        'SLUG_CONFLICT',
      );
    }
  }

  const post = await blogService.createPost(req.body);
  new ApiResponse(
    HTTP_STATUS.CREATED,
    'Blog post created successfully',
    post,
    buildMeta(req),
  ).send(res);
});

/**
 * PUT /admin/blog/posts/:id
 */
export const updateBlogPostHandler = asyncHandler(async (req, res) => {
  const existing = await blogService.getPostAdmin(req.params.id);
  if (!existing) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'Blog post not found',
      'NOT_FOUND',
    );
  }

  if (req.body.slug && req.body.slug !== existing.slug) {
    const exists = await blogService.slugExists(req.body.slug, req.params.id);
    if (exists) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        'A blog post with this slug already exists.',
        'SLUG_CONFLICT',
      );
    }
  }

  const post = await blogService.updatePost(req.params.id, req.body);
  new ApiResponse(
    HTTP_STATUS.OK,
    'Blog post updated successfully',
    post,
    buildMeta(req),
  ).send(res);
});

/**
 * DELETE /admin/blog/posts/:id
 */
export const deleteBlogPostHandler = asyncHandler(async (req, res) => {
  const post = await blogService.getPostAdmin(req.params.id);
  if (!post) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'Blog post not found',
      'NOT_FOUND',
    );
  }
  await blogService.deletePost(req.params.id);
  new ApiResponse(
    HTTP_STATUS.OK,
    'Blog post deleted successfully',
    null,
    buildMeta(req),
  ).send(res);
});

/**
 * POST /admin/blog/posts/:id/publish
 */
export const publishPostHandler = asyncHandler(async (req, res) => {
  const post = await blogService.getPostAdmin(req.params.id);
  if (!post) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'Blog post not found',
      'NOT_FOUND',
    );
  }
  if (post.status === 'PUBLISHED') {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      'Post is already published',
      'CONFLICT',
    );
  }

  const updated = await blogService.updatePost(req.params.id, {
    status: 'PUBLISHED',
    publishedAt: new Date(),
  });
  new ApiResponse(
    HTTP_STATUS.OK,
    'Blog post published successfully',
    updated,
    buildMeta(req),
  ).send(res);
});

/**
 * POST /admin/blog/posts/:id/unpublish
 */
export const unpublishPostHandler = asyncHandler(async (req, res) => {
  const post = await blogService.getPostAdmin(req.params.id);
  if (!post) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'Blog post not found',
      'NOT_FOUND',
    );
  }
  if (post.status !== 'PUBLISHED') {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      'Post is not published',
      'CONFLICT',
    );
  }

  const updated = await blogService.updatePost(req.params.id, {
    status: 'DRAFT',
    publishedAt: null,
  });
  new ApiResponse(
    HTTP_STATUS.OK,
    'Blog post unpublished successfully',
    updated,
    buildMeta(req),
  ).send(res);
});

// --- Categories ---

export const listBlogCategoriesHandler = asyncHandler(async (req, res) => {
  const categories = await blogService.listCategoriesAdmin();
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    categories,
    buildMeta(req),
  ).send(res);
});

export const createBlogCategoryHandler = asyncHandler(async (req, res) => {
  const category = await blogService.createCategory(req.body);
  new ApiResponse(
    HTTP_STATUS.CREATED,
    'Category created successfully',
    category,
    buildMeta(req),
  ).send(res);
});

export const updateBlogCategoryHandler = asyncHandler(async (req, res) => {
  const category = await blogService.updateCategory(req.params.id, req.body);
  if (!category) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'Category not found',
      'NOT_FOUND',
    );
  }
  new ApiResponse(
    HTTP_STATUS.OK,
    'Category updated successfully',
    category,
    buildMeta(req),
  ).send(res);
});

export const deleteBlogCategoryHandler = asyncHandler(async (req, res) => {
  await blogService.deleteCategory(req.params.id);
  new ApiResponse(
    HTTP_STATUS.OK,
    'Category deleted successfully',
    null,
    buildMeta(req),
  ).send(res);
});

// --- Tags ---

export const listBlogTagsHandler = asyncHandler(async (req, res) => {
  const tags = await blogService.listTagsAdmin();
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    tags,
    buildMeta(req),
  ).send(res);
});

export const createBlogTagHandler = asyncHandler(async (req, res) => {
  const tag = await blogService.createTag(req.body);
  new ApiResponse(
    HTTP_STATUS.CREATED,
    'Tag created successfully',
    tag,
    buildMeta(req),
  ).send(res);
});

export const updateBlogTagHandler = asyncHandler(async (req, res) => {
  const tag = await blogService.updateTag(req.params.id, req.body);
  if (!tag) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Tag not found', 'NOT_FOUND');
  }
  new ApiResponse(
    HTTP_STATUS.OK,
    'Tag updated successfully',
    tag,
    buildMeta(req),
  ).send(res);
});

export const deleteBlogTagHandler = asyncHandler(async (req, res) => {
  await blogService.deleteTag(req.params.id);
  new ApiResponse(
    HTTP_STATUS.OK,
    'Tag deleted successfully',
    null,
    buildMeta(req),
  ).send(res);
});

export const blogController = {
  // Public
  listPosts: listPostsHandler,
  getPost: getPostHandler,
  getFeaturedPosts: getFeaturedPostsHandler,
  getCategories: getCategoriesHandler,
  getCategoryPosts: getCategoryPostsHandler,
  getTags: getTagsHandler,
  getTagPosts: getTagPostsHandler,
  getRss: getRssHandler,
  getSitemap: getSitemapHandler,
  // Admin posts
  listPostsAdmin: listBlogPostsAdminHandler,
  getPostAdmin: getBlogPostAdminHandler,
  createPostAdmin: createBlogPostHandler,
  updatePostAdmin: updateBlogPostHandler,
  deletePostAdmin: deleteBlogPostHandler,
  publishPost: publishPostHandler,
  unpublishPost: unpublishPostHandler,
  // Admin categories
  listCategories: listBlogCategoriesHandler,
  createCategory: createBlogCategoryHandler,
  updateCategory: updateBlogCategoryHandler,
  deleteCategory: deleteBlogCategoryHandler,
  // Admin tags
  listTags: listBlogTagsHandler,
  createTag: createBlogTagHandler,
  updateTag: updateBlogTagHandler,
  deleteTag: deleteBlogTagHandler,
};

export default blogController;
