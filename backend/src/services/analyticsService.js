import prisma from '../lib/prisma.js';
import logger from '../utils/logger.js';
import { isBotUserAgent } from '../utils/botDetection.js';
import generateVisitorHash from '../utils/visitorHash.js';
import { parseUserAgent } from '../utils/userAgentParser.js';
import analyticsRepository from '../repositories/analyticsRepository.js';
import { env } from '../config/env.js';

/**
 * Analytics service — business logic for analytics events.
 *
 * Handles:
 * - Event validation and normalization
 * - Bot detection and rejection
 * - Visitor hash generation (privacy-preserving)
 * - User-Agent parsing (device/browser/os)
 * - Country resolution (from request headers)
 * - Delegation to the repository for persistence and aggregation
 */

const DEFAULT_DAYS = 30;
const MAX_LIMIT = 100;

/**
 * Computes the start and end date strings for a date range.
 *
 * @param {number} [days] - Number of days back from now (default: 30).
 * @param {string} [endDateStr] - Optional end date ISO string.
 * @returns {{ startDate: string, endDate: string }}
 */
export function computeDateRange(days, endDateStr) {
  const end = endDateStr ? new Date(endDateStr) : new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - (days || DEFAULT_DAYS));
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

/**
 * Resolves country from request headers.
 *
 * Prefers the cf-ipcountry header (Cloudflare), then x-country,
 * then x-vercel-ip-country. Falls back to "Unknown".
 *
 * @param {object} req - Express request.
 * @returns {string} Country code or "Unknown".
 */
export function resolveCountry(req) {
  const headers = req.headers || {};
  const candidates = [
    headers['cf-ipcountry'],
    headers['x-country'],
    headers['x-vercel-ip-country'],
    headers['x-appengine-country'],
  ];

  for (const value of candidates) {
    if (value && typeof value === 'string' && value.trim().length > 0) {
      const trimmed = value.trim();
      // Reject "XX" / "T1" placeholder values from some CDNs
      if (trimmed.length === 2 && trimmed !== 'XX' && trimmed !== 'T1') {
        return trimmed;
      }
    }
  }

  return 'Unknown';
}

/**
 * Extracts and normalizes the client IP address.
 *
 * @param {object} req - Express request.
 * @returns {string|null} The first IP from x-forwarded-for, or req.ip.
 */
export function getClientIp(req) {
  const headers = req.headers || {};
  const forwarded = headers['x-forwarded-for'];
  if (forwarded) {
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const ip = first?.split(',')[0]?.trim();
    if (ip) return ip;
  }

  return req.ip || null;
}

/**
 * Records an analytics event.
 *
 * Validates the event type, detects bots, generates a visitor hash,
 * parses the User-Agent, resolves the country, and persists the event.
 *
 * @param {object} req - Express request (for IP, headers, UA).
 * @param {object} payload - Normalized event payload from the controller.
 * @param {string} payload.eventType
 * @param {string} payload.path
 * @param {string|null} payload.projectId
 * @param {string|null} payload.blogPostId
 * @param {object|null} payload.metadata
 * @returns {Promise<{recorded: boolean, reason?: string}>}
 */
export const recordEvent = async (req, payload) => {
  const userAgent = req.get('user-agent') || '';

  // Bot protection — silently drop events from known bots/crawlers.
  if (isBotUserAgent(userAgent)) {
    logger.info('Analytics event dropped: bot detected', {
      eventType: payload.eventType,
      path: payload.path,
      requestId: req.id,
    });
    return { recorded: false, reason: 'bot_detected' };
  }

  const ipAddress = getClientIp(req);
  const visitorHash = generateVisitorHash(ipAddress, userAgent);
  const { deviceType, browser, os } = parseUserAgent(userAgent);
  const country = resolveCountry(req);
  const referrer = req.get('referer') || req.get('referrer') || null;

  await analyticsRepository.createEvent({
    eventType: payload.eventType,
    path: payload.path,
    projectId: payload.projectId || null,
    blogPostId: payload.blogPostId || null,
    visitorHash,
    country,
    deviceType,
    browser,
    os,
    referrer,
    metadata: payload.metadata || null,
  });

  return { recorded: true };
};

/**
 * Resolves a project slug to its database ID.
 * Returns null if the project doesn't exist (silently — analytics is non-blocking).
 *
 * @param {string} slug
 * @returns {Promise<string|null>}
 */
export const resolveProjectId = async (slug) => {
  if (!slug) return null;
  try {
    const project = await prisma.project.findUnique({
      where: { slug },
      select: { id: true },
    });
    return project?.id || null;
  } catch (err) {
    logger.warn('resolveProjectId failed', { error: err.message, slug });
    return null;
  }
};

/**
 * Resolves a blog post slug to its database ID.
 * Returns null if the post doesn't exist (silently — analytics is non-blocking).
 *
 * @param {string} slug
 * @returns {Promise<string|null>}
 */
export const resolveBlogPostId = async (slug) => {
  if (!slug) return null;
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, status: true },
    });
    // Only track analytics for published posts
    if (!post || post.status !== 'PUBLISHED') return null;
    return post?.id || null;
  } catch (err) {
    logger.warn('resolveBlogPostId failed', { error: err.message, slug });
    return null;
  }
};

/**
 * Fetches the analytics overview for a date range.
 *
 * @param {object} query - Query params (days, limit).
 * @returns {Promise<object>} Overview stats.
 */
export const getOverview = async (query) => {
  const days = parseInt(query?.days, 10) || DEFAULT_DAYS;
  const { startDate, endDate } = computeDateRange(days);
  const current = await analyticsRepository.getOverview({ startDate, endDate });

  // Previous period for comparison
  const prevDays = days;
  const prevEnd = new Date(startDate);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - prevDays);
  const previous = await analyticsRepository.getOverview({
    startDate: prevStart.toISOString(),
    endDate: prevEnd.toISOString(),
  });

  return { current, previous };
};

/**
 * Fetches time-series data for the date range.
 *
 * @param {object} query
 * @returns {Promise<Array>}
 */
export const getTimeSeries = async (query) => {
  const days = parseInt(query?.days, 10) || DEFAULT_DAYS;
  const { startDate, endDate } = computeDateRange(days);
  return analyticsRepository.getTimeSeries({ startDate, endDate });
};

/**
 * Fetches top pages.
 *
 * @param {object} query
 * @returns {Promise<Array>}
 */
export const getTopPages = async (query) => {
  const days = parseInt(query?.days, 10) || DEFAULT_DAYS;
  const limit = Math.min(parseInt(query?.limit, 10) || 20, MAX_LIMIT);
  const { startDate, endDate } = computeDateRange(days);
  return analyticsRepository.getTopPages({ startDate, endDate, limit });
};

/**
 * Fetches country distribution.
 *
 * @param {object} query
 * @returns {Promise<Array>}
 */
export const getCountries = async (query) => {
  const days = parseInt(query?.days, 10) || DEFAULT_DAYS;
  const limit = Math.min(parseInt(query?.limit, 10) || 20, MAX_LIMIT);
  const { startDate, endDate } = computeDateRange(days);
  return analyticsRepository.getCountries({ startDate, endDate, limit });
};

/**
 * Fetches device type distribution.
 *
 * @param {object} query
 * @returns {Promise<Array>}
 */
export const getDevices = async (query) => {
  const days = parseInt(query?.days, 10) || DEFAULT_DAYS;
  const { startDate, endDate } = computeDateRange(days);
  return analyticsRepository.getDevices({ startDate, endDate });
};

/**
 * Fetches browser distribution.
 *
 * @param {object} query
 * @returns {Promise<Array>}
 */
export const getBrowsers = async (query) => {
  const days = parseInt(query?.days, 10) || DEFAULT_DAYS;
  const { startDate, endDate } = computeDateRange(days);
  return analyticsRepository.getBrowsers({ startDate, endDate });
};

/**
 * Fetches project analytics (views + clicks).
 *
 * @param {object} query
 * @returns {Promise<Array>}
 */
export const getProjectStats = async (query) => {
  const days = parseInt(query?.days, 10) || DEFAULT_DAYS;
  const limit = Math.min(parseInt(query?.limit, 10) || 20, MAX_LIMIT);
  const { startDate, endDate } = computeDateRange(days);
  const [stats, breakdown] = await Promise.all([
    analyticsRepository.getProjectStats({ startDate, endDate, limit }),
    analyticsRepository.getProjectClickBreakdown({ startDate, endDate }),
  ]);

  // Merge click breakdown into stats
  const breakdownMap = new Map(breakdown.map((b) => [b.slug, b]));
  return stats.map((s) => ({
    ...s,
    githubClicks: breakdownMap.get(s.slug)?.githubClicks || 0,
    demoClicks: breakdownMap.get(s.slug)?.demoClicks || 0,
  }));
};

/**
 * Fetches referrer distribution.
 *
 * @param {object} query
 * @returns {Promise<Array>}
 */
export const getReferrers = async (query) => {
  const days = parseInt(query?.days, 10) || DEFAULT_DAYS;
  const limit = Math.min(parseInt(query?.limit, 10) || 20, MAX_LIMIT);
  const { startDate, endDate } = computeDateRange(days);
  return analyticsRepository.getReferrers({ startDate, endDate, limit });
};

/**
 * Deletes events older than the configured retention period.
 * Intended for a scheduled cleanup job.
 *
 * @returns {Promise<number>}
 */
export const cleanupOldEvents = async () => {
  return analyticsRepository.cleanupOldEvents(env.analytics.retentionDays);
};

export default {
  recordEvent,
  resolveProjectId,
  resolveBlogPostId,
  getOverview,
  getTimeSeries,
  getTopPages,
  getCountries,
  getDevices,
  getBrowsers,
  getProjectStats,
  getReferrers,
  cleanupOldEvents,
  computeDateRange,
  resolveCountry,
  getClientIp,
};
