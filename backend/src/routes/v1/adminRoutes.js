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

const router = Router();

/**
 * Admin CRUD API — mounted at /api/v1/admin.
 * Full CRUD over PostgreSQL for all portfolio resources.
 */

// Stats
router.get('/stats', getStatsHandler);

// Profile (single record)
router.get('/profile', getAdminProfileHandler);
router.put('/profile', updateAdminProfileHandler);

// Projects
router.get('/projects', adminController.projects.list);
router.get('/projects/:id', adminController.projects.get);
router.post('/projects', adminController.projects.create);
router.put('/projects/:id', adminController.projects.update);
router.delete('/projects/:id', adminController.projects.remove);

// Skills
router.get('/skills', adminController.skills.list);
router.get('/skills/:id', adminController.skills.get);
router.post('/skills', adminController.skills.create);
router.put('/skills/:id', adminController.skills.update);
router.delete('/skills/:id', adminController.skills.remove);

// Experience
router.get('/experience', adminController.experience.list);
router.get('/experience/:id', adminController.experience.get);
router.post('/experience', adminController.experience.create);
router.put('/experience/:id', adminController.experience.update);
router.delete('/experience/:id', adminController.experience.remove);

// Education
router.get('/education', adminController.education.list);
router.get('/education/:id', adminController.education.get);
router.post('/education', adminController.education.create);
router.put('/education/:id', adminController.education.update);
router.delete('/education/:id', adminController.education.remove);

// Certificates
router.get('/certificates', adminController.certificates.list);
router.get('/certificates/:id', adminController.certificates.get);
router.post('/certificates', adminController.certificates.create);
router.put('/certificates/:id', adminController.certificates.update);
router.delete('/certificates/:id', adminController.certificates.remove);

// Achievements
router.get('/achievements', adminController.achievements.list);
router.get('/achievements/:id', adminController.achievements.get);
router.post('/achievements', adminController.achievements.create);
router.put('/achievements/:id', adminController.achievements.update);
router.delete('/achievements/:id', adminController.achievements.remove);

// Social links
router.get('/social-links', adminController.socialLinks.list);
router.get('/social-links/:id', adminController.socialLinks.get);
router.post('/social-links', adminController.socialLinks.create);
router.put('/social-links/:id', adminController.socialLinks.update);
router.delete('/social-links/:id', adminController.socialLinks.remove);

// Contact messages
router.get('/contact-messages', listContactMessagesHandler);
router.get('/contact-messages/:id', getContactMessageHandler);
router.put('/contact-messages/:id', updateContactMessageHandler);
router.delete('/contact-messages/:id', deleteContactMessageHandler);

export default router;
