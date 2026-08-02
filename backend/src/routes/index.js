import { Router } from 'express';
import v1Routes from './v1/index.js';
import { env } from '../config/env.js';

const router = Router();

/**
 * Versioned API router. Mounts v1 routes under the configured prefix.
 */
router.use(env.apiPrefix, v1Routes);

export default router;
