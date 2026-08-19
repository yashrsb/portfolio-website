import { Router } from 'express';
import analyticsController from '../../controllers/analyticsController.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { analyticsEventValidators } from '../../validators/analyticsValidator.js';
import analyticsRateLimiter from '../../config/analyticsRateLimit.js';

const router = Router();

/**
 * Public analytics ingestion endpoint.
 * Rate-limited to prevent abuse.
 * POST /api/v1/analytics/events
 */
router.post(
  '/events',
  analyticsRateLimiter,
  analyticsEventValidators,
  validateRequest,
  analyticsController.recordEventHandler,
);

export default router;
