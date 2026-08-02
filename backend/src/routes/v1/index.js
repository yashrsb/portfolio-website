import { Router } from 'express';
import {
  getHealthHandler,
  getProjectsHandler,
  getExperienceHandler,
  getSkillsHandler,
  getEducationHandler,
  getProfileHandler,
  getSocialHandler,
  postContactHandler,
} from '../../controllers/index.js';
import { contactValidationRules } from '../../validators/contactValidator.js';
import validateRequest from '../../middlewares/validateRequest.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { env } from '../../config/env.js';
import adminRoutes from './adminRoutes.js';

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
      method: 'POST',
      path: '/contact',
      description: 'Submit a contact message (mock)',
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
router.get('/experience', getExperienceHandler);
router.get('/skills', getSkillsHandler);
router.get('/education', getEducationHandler);
router.get('/profile', getProfileHandler);
router.get('/social', getSocialHandler);
router.post(
  '/contact',
  contactValidationRules,
  validateRequest,
  postContactHandler,
);

// Admin CRUD API
router.use('/admin', adminRoutes);

export default router;
