import { Router } from 'express';
import { adminController } from '../../controllers/adminController.js';
import {
  getAdminProfileHandler,
  updateAdminProfileHandler,
  listContactMessagesHandler,
  getContactMessageHandler,
  updateContactMessageHandler,
  deleteContactMessageHandler,
  getStatsHandler,
} from '../../controllers/adminController.js';
import blogController from '../../controllers/blogController.js';
import {
  getResumeHandler,
  uploadResumeHandler,
  replaceResumeHandler,
  deleteResumeHandler,
} from '../../controllers/resumeController.js';
import upload from '../../middlewares/upload.js';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { idValidator } from '../../validators/idValidator.js';
import { reorderValidator } from '../../validators/reorderValidator.js';
import { projectValidators } from '../../validators/projectValidator.js';
import { skillValidators } from '../../validators/skillValidator.js';
import { experienceValidators } from '../../validators/experienceValidator.js';
import { educationValidators } from '../../validators/educationValidator.js';
import { certificateValidators } from '../../validators/certificateValidator.js';
import { achievementValidators } from '../../validators/achievementValidator.js';
import { socialLinkValidators } from '../../validators/socialLinkValidator.js';
import {
  blogPostValidators,
  blogCategoryValidators,
  blogTagValidators,
} from '../../validators/blogValidator.js';

const router = Router();

/**
 * Admin CRUD API — mounted at /api/v1/admin.
 * All routes require a valid ADMIN session.
 * Mutations are validated with resource-specific validators.
 */

// Apply auth + authorization to every admin route.
router.use(authenticate, authorize('ADMIN'));

// Stats
router.get('/stats', getStatsHandler);

// Profile (single record)
router.get('/profile', getAdminProfileHandler);
router.put('/profile', updateAdminProfileHandler);

// Projects
router.get('/projects', adminController.projects.list);
router.get(
  '/projects/:id',
  idValidator,
  validateRequest,
  adminController.projects.get,
);
router.patch(
  '/projects/reorder',
  reorderValidator,
  validateRequest,
  adminController.projects.reorder,
);
router.post(
  '/projects',
  projectValidators.create,
  validateRequest,
  adminController.projects.create,
);
router.put(
  '/projects/:id',
  [...idValidator, ...projectValidators.update],
  validateRequest,
  adminController.projects.update,
);
router.delete(
  '/projects/:id',
  idValidator,
  validateRequest,
  adminController.projects.remove,
);

// Skills
router.get('/skills', adminController.skills.list);
router.get(
  '/skills/:id',
  idValidator,
  validateRequest,
  adminController.skills.get,
);
router.patch(
  '/skills/reorder',
  reorderValidator,
  validateRequest,
  adminController.skills.reorder,
);
router.post(
  '/skills',
  skillValidators.create,
  validateRequest,
  adminController.skills.create,
);
router.put(
  '/skills/:id',
  [...idValidator, ...skillValidators.update],
  validateRequest,
  adminController.skills.update,
);
router.delete(
  '/skills/:id',
  idValidator,
  validateRequest,
  adminController.skills.remove,
);

// Experience
router.get('/experience', adminController.experience.list);
router.get(
  '/experience/:id',
  idValidator,
  validateRequest,
  adminController.experience.get,
);
router.patch(
  '/experience/reorder',
  reorderValidator,
  validateRequest,
  adminController.experience.reorder,
);
router.post(
  '/experience',
  experienceValidators.create,
  validateRequest,
  adminController.experience.create,
);
router.put(
  '/experience/:id',
  [...idValidator, ...experienceValidators.update],
  validateRequest,
  adminController.experience.update,
);
router.delete(
  '/experience/:id',
  idValidator,
  validateRequest,
  adminController.experience.remove,
);

// Education
router.get('/education', adminController.education.list);
router.get(
  '/education/:id',
  idValidator,
  validateRequest,
  adminController.education.get,
);
router.patch(
  '/education/reorder',
  reorderValidator,
  validateRequest,
  adminController.education.reorder,
);
router.post(
  '/education',
  educationValidators.create,
  validateRequest,
  adminController.education.create,
);
router.put(
  '/education/:id',
  [...idValidator, ...educationValidators.update],
  validateRequest,
  adminController.education.update,
);
router.delete(
  '/education/:id',
  idValidator,
  validateRequest,
  adminController.education.remove,
);

// Certificates
router.get('/certificates', adminController.certificates.list);
router.get(
  '/certificates/:id',
  idValidator,
  validateRequest,
  adminController.certificates.get,
);
router.patch(
  '/certificates/reorder',
  reorderValidator,
  validateRequest,
  adminController.certificates.reorder,
);
router.post(
  '/certificates',
  certificateValidators.create,
  validateRequest,
  adminController.certificates.create,
);
router.put(
  '/certificates/:id',
  [...idValidator, ...certificateValidators.update],
  validateRequest,
  adminController.certificates.update,
);
router.delete(
  '/certificates/:id',
  idValidator,
  validateRequest,
  adminController.certificates.remove,
);

// Achievements
router.get('/achievements', adminController.achievements.list);
router.get(
  '/achievements/:id',
  idValidator,
  validateRequest,
  adminController.achievements.get,
);
router.patch(
  '/achievements/reorder',
  reorderValidator,
  validateRequest,
  adminController.achievements.reorder,
);
router.post(
  '/achievements',
  achievementValidators.create,
  validateRequest,
  adminController.achievements.create,
);
router.put(
  '/achievements/:id',
  [...idValidator, ...achievementValidators.update],
  validateRequest,
  adminController.achievements.update,
);
router.delete(
  '/achievements/:id',
  idValidator,
  validateRequest,
  adminController.achievements.remove,
);

// Social links
router.get('/social-links', adminController.socialLinks.list);
router.get(
  '/social-links/:id',
  idValidator,
  validateRequest,
  adminController.socialLinks.get,
);
router.patch(
  '/social-links/reorder',
  reorderValidator,
  validateRequest,
  adminController.socialLinks.reorder,
);
router.post(
  '/social-links',
  socialLinkValidators.create,
  validateRequest,
  adminController.socialLinks.create,
);
router.put(
  '/social-links/:id',
  [...idValidator, ...socialLinkValidators.update],
  validateRequest,
  adminController.socialLinks.update,
);
router.delete(
  '/social-links/:id',
  idValidator,
  validateRequest,
  adminController.socialLinks.remove,
);

// Contact messages
router.get('/contact-messages', listContactMessagesHandler);
router.get(
  '/contact-messages/:id',
  idValidator,
  validateRequest,
  getContactMessageHandler,
);
router.put(
  '/contact-messages/:id',
  idValidator,
  validateRequest,
  updateContactMessageHandler,
);
router.delete(
  '/contact-messages/:id',
  idValidator,
  validateRequest,
  deleteContactMessageHandler,
);

// Resume (single file)
router.get('/resume', getResumeHandler);
router.post('/resume', upload.single('resume'), uploadResumeHandler);
router.put('/resume', upload.single('resume'), replaceResumeHandler);
router.delete('/resume', deleteResumeHandler);

// Blog posts
router.get('/blog/posts', blogController.listPostsAdmin);
router.get(
  '/blog/posts/:id',
  idValidator,
  validateRequest,
  blogController.getPostAdmin,
);
router.post(
  '/blog/posts',
  blogPostValidators.create,
  validateRequest,
  blogController.createPostAdmin,
);
router.put(
  '/blog/posts/:id',
  [...idValidator, ...blogPostValidators.update],
  validateRequest,
  blogController.updatePostAdmin,
);
router.delete(
  '/blog/posts/:id',
  idValidator,
  validateRequest,
  blogController.deletePostAdmin,
);
router.post(
  '/blog/posts/:id/publish',
  idValidator,
  validateRequest,
  blogController.publishPost,
);
router.post(
  '/blog/posts/:id/unpublish',
  idValidator,
  validateRequest,
  blogController.unpublishPost,
);

// Blog categories
router.get('/blog/categories', blogController.listCategories);
router.post(
  '/blog/categories',
  blogCategoryValidators.create,
  validateRequest,
  blogController.createCategory,
);
router.put(
  '/blog/categories/:id',
  [...idValidator, ...blogCategoryValidators.update],
  validateRequest,
  blogController.updateCategory,
);
router.delete(
  '/blog/categories/:id',
  idValidator,
  validateRequest,
  blogController.deleteCategory,
);

// Blog tags
router.get('/blog/tags', blogController.listTags);
router.post(
  '/blog/tags',
  blogTagValidators.create,
  validateRequest,
  blogController.createTag,
);
router.put(
  '/blog/tags/:id',
  [...idValidator, ...blogTagValidators.update],
  validateRequest,
  blogController.updateTag,
);
router.delete(
  '/blog/tags/:id',
  idValidator,
  validateRequest,
  blogController.deleteTag,
);

export default router;
