import analyticsService from '../services/analyticsService.js';
import {
  resolveProjectId,
  resolveBlogPostId,
} from '../services/analyticsService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { MESSAGES } from '../constants/messages.js';

const buildMeta = (req) => ({
  timestamp: new Date().toISOString(),
  requestId: req.id,
});

/**
 * POST /api/v1/analytics/events
 *
 * Public analytics ingestion endpoint. Accepts a validated event,
 * enriches it with server-side data (IP hash, UA parsing, country, referrer),
 * and stores it. Bots are silently dropped. Returns 202 Accepted.
 *
 * The response is always 202 (regardless of bot drop) so that the client
 * cannot distinguish whether an event was recorded — preventing manipulation.
 */
export const recordEventHandler = asyncHandler(async (req, res) => {
  const { eventType, path: reqPath, projectSlug, blogPostSlug, metadata } = req.body;

  // Resolve slugs to database IDs (best-effort, non-blocking)
  let projectId = null;
  let blogPostId = null;

  if (projectSlug) {
    projectId = await resolveProjectId(projectSlug);
  }
  if (blogPostSlug) {
    blogPostId = await resolveBlogPostId(blogPostSlug);
  }

  await analyticsService.recordEvent(req, {
    eventType,
    path: reqPath,
    projectId,
    blogPostId,
    metadata,
  });

  new ApiResponse(
    HTTP_STATUS.ACCEPTED,
    'Event accepted.',
    { recorded: true },
    buildMeta(req),
  ).send(res);
});

/**
 * GET /api/v1/admin/analytics/overview
 * Requires ADMIN auth.
 */
export const getOverviewHandler = asyncHandler(async (req, res) => {
  const data = await analyticsService.getOverview(req.query);
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    data,
    buildMeta(req),
  ).send(res);
});

/**
 * GET /api/v1/admin/analytics/timeseries
 * Requires ADMIN auth.
 */
export const getTimeSeriesHandler = asyncHandler(async (req, res) => {
  const data = await analyticsService.getTimeSeries(req.query);
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    data,
    buildMeta(req),
  ).send(res);
});

/**
 * GET /api/v1/admin/analytics/pages
 * Requires ADMIN auth.
 */
export const getTopPagesHandler = asyncHandler(async (req, res) => {
  const data = await analyticsService.getTopPages(req.query);
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    data,
    buildMeta(req),
  ).send(res);
});

/**
 * GET /api/v1/admin/analytics/countries
 * Requires ADMIN auth.
 */
export const getCountriesHandler = asyncHandler(async (req, res) => {
  const data = await analyticsService.getCountries(req.query);
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    data,
    buildMeta(req),
  ).send(res);
});

/**
 * GET /api/v1/admin/analytics/devices
 * Requires ADMIN auth.
 */
export const getDevicesHandler = asyncHandler(async (req, res) => {
  const data = await analyticsService.getDevices(req.query);
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    data,
    buildMeta(req),
  ).send(res);
});

/**
 * GET /api/v1/admin/analytics/browsers
 * Requires ADMIN auth.
 */
export const getBrowsersHandler = asyncHandler(async (req, res) => {
  const data = await analyticsService.getBrowsers(req.query);
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    data,
    buildMeta(req),
  ).send(res);
});

/**
 * GET /api/v1/admin/analytics/projects
 * Requires ADMIN auth.
 */
export const getProjectStatsHandler = asyncHandler(async (req, res) => {
  const data = await analyticsService.getProjectStats(req.query);
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    data,
    buildMeta(req),
  ).send(res);
});

/**
 * GET /api/v1/admin/analytics/referrers
 * Requires ADMIN auth.
 */
export const getReferrersHandler = asyncHandler(async (req, res) => {
  const data = await analyticsService.getReferrers(req.query);
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    data,
    buildMeta(req),
  ).send(res);
});

export default {
  recordEventHandler,
  getOverviewHandler,
  getTimeSeriesHandler,
  getTopPagesHandler,
  getCountriesHandler,
  getDevicesHandler,
  getBrowsersHandler,
  getProjectStatsHandler,
  getReferrersHandler,
};
