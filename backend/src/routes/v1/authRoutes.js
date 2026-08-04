import { Router } from 'express';
import {
  loginHandler,
  refreshHandler,
  logoutHandler,
  meHandler,
} from '../../controllers/authController.js';
import { loginValidator } from '../../validators/authValidator.js';
import validateRequest from '../../middlewares/validateRequest.js';
import authenticate from '../../middlewares/authenticate.js';

const router = Router();

/**
 * Auth routes — mounted at /api/v1/auth.
 */
router.post('/login', loginValidator, validateRequest, loginHandler);
router.post('/refresh', refreshHandler);
router.post('/logout', logoutHandler);
router.get('/me', authenticate, meHandler);

export default router;
