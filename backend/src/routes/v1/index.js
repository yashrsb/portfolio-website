import { Router } from 'express';
import {
  getHealthHandler,
  getProjectsHandler,
  getProjectBySlugHandler,
  getExperienceHandler,
  getSkillsHandler,
  getEducationHandler,
  getProfileHandler,
  getSocialHandler,
  postContactHandler,
  listPostsHandler,
  getPostHandler,
  getFeaturedPostsHandler,
  getCategoriesHandler,
  getCategoryPostsHandler,
  getTagsHandler,
  getTagPostsHandler,
  getSitemapHandler,
} from '../../controllers/index.js';
import { contactValidationRules } from '../../validators/contactValidator.js';
import { downloadResumeHandler } from '../../controllers/resumeController.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { spamProtection } from '../../middlewares/index.js';
import { contactRateLimiter } from '../../config/index.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { env } from '../../config/env.js';
import adminRoutes from './adminRoutes.js';
import authRoutes from './authRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import { slugValidator } from '../../validators/idValidator.js';
import {
  blogSlugValidator,
  blogCategorySlugValidator,
  blogTagSlugValidator,
} from '../../validators/blogValidator.js';

const router = Router();

/**
 * Root endpoint listing available API endpoints.
 */
router.get('/', (req, res) => {
  const endpoints = [
    { method: 'GET', path: '/health', description: 'Service health status' },
    { method: 'GET', path: '/projects', description: 'List all projects' },
    {
      method: 'GET',
      path: '/projects/:slug',
      description: 'Get a single project by slug',
    },
    {
      method: 'GET',
      path: '/experience',
      description: 'Work experience entries',
    },
    {
      method: 'GET',
      path: '/skills',
      description: 'Skills grouped by category',
    },
    {
      method: 'GET',
      path: '/education',
      description: 'Education, certificates, and achievements',
    },
    { method: 'GET', path: '/profile', description: 'Profile information' },
    { method: 'GET', path: '/social', description: 'Social links' },
    {
      method: 'GET',
      path: '/resume/download',
      description: 'Download the latest resume (public)',
    },
    {
      method: 'POST',
      path: '/contact',
      description: 'Submit a contact message (validated, rate-limited)',
    },
    {
      method: 'GET',
      path: '/admin/stats',
      description: 'Dashboard stats (authenticated)',
    },
    {
      method: 'GET|POST|PUT|PATCH|DELETE',
      path: '/admin/projects',
      description: 'Admin project CRUD + reorder (authenticated)',
    },
    {
      method: 'GET|POST|PUT|PATCH|DELETE',
      path: '/admin/skills',
      description: 'Admin skill CRUD + reorder (authenticated)',
    },
    {
      method: 'GET|POST|PUT|PATCH|DELETE',
      path: '/admin/experience',
      description: 'Admin experience CRUD + reorder (authenticated)',
    },
    {
      method: 'GET|POST|PUT|PATCH|DELETE',
      path: '/admin/education',
      description: 'Admin education CRUD + reorder (authenticated)',
    },
    {
      method: 'GET|POST|PUT|PATCH|DELETE',
      path: '/admin/certificates',
      description: 'Admin certificate CRUD + reorder (authenticated)',
    },
    {
      method: 'GET|POST|PUT|PATCH|DELETE',
      path: '/admin/achievements',
      description: 'Admin achievement CRUD + reorder (authenticated)',
    },
    {
      method: 'GET|POST|PUT|PATCH|DELETE',
      path: '/admin/social-links',
      description: 'Admin social link CRUD + reorder (authenticated)',
    },
    {
      method: 'GET|PUT|DELETE',
      path: '/admin/contact-messages',
      description: 'Admin contact message management (authenticated)',
    },
    {
      method: 'GET|POST|PUT|PATCH|DELETE',
      path: '/admin/blog/posts',
      description: 'Admin blog post CRUD (authenticated)',
    },
    {
      method: 'GET|POST|PUT|DELETE',
      path: '/admin/blog/categories',
      description: 'Admin blog category CRUD (authenticated)',
    },
    {
      method: 'GET|POST|PUT|DELETE',
      path: '/admin/blog/tags',
      description: 'Admin blog tag CRUD (authenticated)',
    },
    {
      method: 'POST',
      path: '/admin/blog/posts/:id/publish',
      description: 'Publish a blog post (authenticated)',
    },
    {
      method: 'POST',
      path: '/admin/blog/posts/:id/unpublish',
      description: 'Unpublish a blog post (authenticated)',
    },
    { method: 'GET', path: '/rss.xml', description: 'RSS feed for blog posts' },
    {
      method: 'GET',
      path: '/blog/sitemap',
      description: 'JSON sitemap data for blog posts',
    },
    {
      method: 'POST',
      path: '/analytics/events',
      description: 'Track an analytics event (rate-limited, bot-filtered)',
    },
    {
      method: 'GET',
      path: '/admin/analytics/dashboard',
      description:
        'Aggregated analytics dashboard data (single-response, ADMIN only)',
    },
    {
      method: 'GET|POST',
      path: '/admin/analytics',
      description: 'Admin analytics dashboard data (authenticated, ADMIN only)',
    },
  ];
  const data = {
    version: env.apiVersion,
    baseUrl: `http://localhost:${env.port}${env.apiPrefix}`,
    endpoints,
  };
  new ApiResponse(
    HTTP_STATUS.OK,
    'API endpoints retrieved successfully',
    data,
    { timestamp: new Date().toISOString(), requestId: req.id },
  ).send(res);
});

router.get('/health', getHealthHandler);
router.get('/projects', getProjectsHandler);
router.get(
  '/projects/:slug',
  slugValidator,
  validateRequest,
  getProjectBySlugHandler,
);
router.get('/experience', getExperienceHandler);
router.get('/skills', getSkillsHandler);
router.get('/education', getEducationHandler);
router.get('/profile', getProfileHandler);
router.get('/social', getSocialHandler);

// Public resume download
router.get('/resume/download', downloadResumeHandler);

router.post(
  '/contact',
  contactRateLimiter,
  spamProtection,
  contactValidationRules,
  validateRequest,
  postContactHandler,
);

// Public blog routes
router.get('/blog/posts', listPostsHandler);
router.get(
  '/blog/posts/:slug',
  blogSlugValidator,
  validateRequest,
  getPostHandler,
);
router.get('/blog/featured', getFeaturedPostsHandler);
router.get('/blog/categories', getCategoriesHandler);
router.get(
  '/blog/categories/:slug/posts',
  blogCategorySlugValidator,
  validateRequest,
  getCategoryPostsHandler,
);
router.get('/blog/tags', getTagsHandler);
router.get(
  '/blog/tags/:slug/posts',
  blogTagSlugValidator,
  validateRequest,
  getTagPostsHandler,
);
router.get('/blog/sitemap', getSitemapHandler);

// Public analytics ingestion endpoint
router.use('/analytics', analyticsRoutes);

// Auth routes
router.use('/auth', authRoutes);

// Admin CRUD API
router.use('/admin', adminRoutes);

export default router;
