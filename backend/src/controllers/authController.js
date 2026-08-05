import { env } from '../config/env.js';
import * as authService from '../services/authService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { MESSAGES } from '../constants/messages.js';

/**
 * Builds response metadata (timestamp + request id).
 * @param {object} req - Express request.
 * @returns {object} Meta object.
 */
const buildMeta = (req) => ({
  timestamp: new Date().toISOString(),
  requestId: req.id,
});

/**
 * Sets the refresh token as an httpOnly cookie.
 * @param {import('express').Response} res - Express response.
 * @param {string} token - Raw refresh token.
 * @param {number} maxAge - Cookie max age in milliseconds.
 */
const setRefreshCookie = (res, token, maxAge) => {
  res.cookie(env.auth.refreshTokenCookieName, token, {
    httpOnly: true,
    secure: env.auth.cookieSecure,
    sameSite: env.auth.cookieSameSite,
    maxAge,
    path: `${env.apiPrefix}/auth`,
  });
};

/**
 * Clears the refresh token cookie.
 * @param {import('express').Response} res - Express response.
 */
const clearRefreshCookie = (res) => {
  res.clearCookie(env.auth.refreshTokenCookieName, {
    httpOnly: true,
    secure: env.auth.cookieSecure,
    sameSite: env.auth.cookieSameSite,
    path: `${env.apiPrefix}/auth`,
  });
};

/**
 * POST /auth/login
 * Authenticates credentials and returns an access token.
 */
export const loginHandler = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  setRefreshCookie(res, result.refreshToken, result.maxAge);

  new ApiResponse(
    HTTP_STATUS.OK,
    'Login successful.',
    {
      accessToken: result.accessToken,
      user: result.user,
    },
    buildMeta(req),
  ).send(res);
});

/**
 * POST /auth/refresh
 * Rotates the refresh token and returns a fresh access token.
 */
export const refreshHandler = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[env.auth.refreshTokenCookieName];
  const result = await authService.refresh(refreshToken);
  setRefreshCookie(res, result.refreshToken, result.maxAge);

  new ApiResponse(
    HTTP_STATUS.OK,
    'Token refreshed successfully.',
    {
      accessToken: result.accessToken,
      user: result.user,
    },
    buildMeta(req),
  ).send(res);
});

/**
 * POST /auth/logout
 * Revokes the refresh token and clears the cookie.
 */
export const logoutHandler = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[env.auth.refreshTokenCookieName];
  await authService.logout(refreshToken);
  clearRefreshCookie(res);

  new ApiResponse(
    HTTP_STATUS.OK,
    'Logged out successfully.',
    null,
    buildMeta(req),
  ).send(res);
});

/**
 * GET /auth/me
 * Returns the authenticated user.
 */
export const meHandler = asyncHandler(async (req, res) => {
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    { user: req.user },
    buildMeta(req),
  ).send(res);
});
