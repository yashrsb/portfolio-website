import prisma from '../lib/prisma.js';
import logger from '../utils/logger.js';

/**
 * Analytics repository — direct Prisma queries for analytics data.
 * All aggregation happens in PostgreSQL; only aggregated results are returned.
 */

const EVENT_TYPES = ['PAGE_VIEW', 'PROJECT_VIEW', 'PROJECT_CLICK', 'BLOG_POST_VIEW'];

/**
 * Creates a new analytics event record.
 *
 * @param {object} data
 * @param {string} data.eventType - Validated event type.
 * @param {string} data.path - Request path.
 * @param {string|null} data.projectId
 * @param {string|null} data.blogPostId
 * @param {string} data.visitorHash - Privacy-preserving hash.
 * @param {string|null} data.country
 * @param {string} data.deviceType
 * @param {string} data.browser
 * @param {string} data.os
 * @param {string|null} data.referrer
 * @param {object|null} data.metadata
 * @returns {Promise<object>} Created event (only non-sensitive fields).
 */
export const createEvent = async (data) => {
  try {
    return await prisma.analyticsEvent.create({
      data: {
        eventType: data.eventType,
        path: data.path,
        projectId: data.projectId || undefined,
        blogPostId: data.blogPostId || undefined,
        visitorHash: data.visitorHash,
        country: data.country || undefined,
        deviceType: data.deviceType,
        browser: data.browser,
        os: data.os,
        referrer: data.referrer || undefined,
        metadata: data.metadata || undefined,
      },
    });
  } catch (err) {
    logger.error('createEvent failed', { error: err.message });
    throw err;
  }
};

/**
 * Returns aggregated analytics overview for a date range.
 *
 * @param {object} params
 * @param {string} params.startDate - ISO date string.
 * @param {string} params.endDate - ISO date string.
 * @returns {Promise<{ totalVisitors: number, totalPageViews: number, totalProjectViews: number, totalProjectClicks: number, totalBlogViews: number }>}
 */
export const getOverview = async ({ startDate, endDate }) => {
  try {
    const where = {
      createdAt: { gte: new Date(startDate), lte: new Date(endDate) },
    };

    const [
      totalVisitors,
      totalPageViews,
      totalProjectViews,
      totalProjectClicks,
      totalBlogViews,
    ] = await Promise.all([
      prisma.$queryRaw`
        SELECT COUNT(DISTINCT "visitorHash") AS count
        FROM "AnalyticsEvent"
        WHERE "createdAt" >= ${new Date(startDate)}
          AND "createdAt" <= ${new Date(endDate)}
          AND "eventType" = 'PAGE_VIEW'
      `.then((rows) => Number(rows[0]?.count || 0)),
      prisma.analyticsEvent.count({
        where: { ...where, eventType: 'PAGE_VIEW' },
      }),
      prisma.analyticsEvent.count({
        where: { ...where, eventType: 'PROJECT_VIEW' },
      }),
      prisma.analyticsEvent.count({
        where: { ...where, eventType: 'PROJECT_CLICK' },
      }),
      prisma.analyticsEvent.count({
        where: { ...where, eventType: 'BLOG_POST_VIEW' },
      }),
    ]);

    return {
      totalVisitors,
      totalPageViews,
      totalProjectViews,
      totalProjectClicks,
      totalBlogViews,
    };
  } catch (err) {
    logger.error('getOverview failed', { error: err.message });
    throw err;
  }
};

/**
 * Returns time-series data (visitors + page views per day).
 *
 * @param {object} params
 * @param {string} params.startDate
 * @param {string} params.endDate
 * @returns {Promise<Array<{date: string, visitors: number, pageViews: number}>>}
 */
export const getTimeSeries = async ({ startDate, endDate }) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT
        date_trunc('day', "createdAt") AS "date",
        COUNT(*) FILTER (WHERE "eventType" = 'PAGE_VIEW') AS "pageViews",
        COUNT(DISTINCT CASE WHEN "eventType" = 'PAGE_VIEW' THEN "visitorHash" END) AS "visitors"
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${new Date(startDate)}
        AND "createdAt" <= ${new Date(endDate)}
        AND "eventType" IN ('PAGE_VIEW', 'PROJECT_VIEW', 'PROJECT_CLICK', 'BLOG_POST_VIEW')
      GROUP BY date_trunc('day', "createdAt")
      ORDER BY "date" ASC
    `;

    return result.map((row) => ({
      date: new Date(row.date).toISOString().slice(0, 10),
      visitors: Number(row.visitors),
      pageViews: Number(row.pageViews),
    }));
  } catch (err) {
    logger.error('getTimeSeries failed', { error: err.message });
    throw err;
  }
};

/**
 * Returns the top pages by view count.
 *
 * @param {object} params
 * @param {string} params.startDate
 * @param {string} params.endDate
 * @param {number} params.limit
 * @returns {Promise<Array<{path: string, views: number, uniqueVisitors: number}>>}
 */
export const getTopPages = async ({ startDate, endDate, limit = 20 }) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT
        "path",
        COUNT(*) AS "views",
        COUNT(DISTINCT "visitorHash") AS "uniqueVisitors"
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${new Date(startDate)}
        AND "createdAt" <= ${new Date(endDate)}
        AND "eventType" = 'PAGE_VIEW'
      GROUP BY "path"
      ORDER BY "views" DESC
      LIMIT ${limit}::integer
    `;

    return result.map((row) => ({
      path: row.path,
      views: Number(row.views),
      uniqueVisitors: Number(row.uniqueVisitors),
    }));
  } catch (err) {
    logger.error('getTopPages failed', { error: err.message });
    throw err;
  }
};

/**
 * Returns country distribution.
 *
 * @param {object} params
 * @param {string} params.startDate
 * @param {string} params.endDate
 * @param {number} params.limit
 * @returns {Promise<Array<{country: string, visitors: number, percentage: number}>>}
 */
export const getCountries = async ({ startDate, endDate, limit = 20 }) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT
        COALESCE("country", 'Unknown') AS "country",
        COUNT(DISTINCT "visitorHash") AS "visitors"
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${new Date(startDate)}
        AND "createdAt" <= ${new Date(endDate)}
        AND "eventType" = 'PAGE_VIEW'
      GROUP BY COALESCE("country", 'Unknown')
      ORDER BY "visitors" DESC
      LIMIT ${limit}::integer
    `;

    const total = result.reduce((sum, row) => sum + Number(row.visitors), 0);

    return result.map((row) => ({
      country: row.country,
      visitors: Number(row.visitors),
      percentage: total > 0 ? Number(((Number(row.visitors) / total) * 100).toFixed(1)) : 0,
    }));
  } catch (err) {
    logger.error('getCountries failed', { error: err.message });
    throw err;
  }
};

/**
 * Returns device type distribution.
 *
 * @param {object} params
 * @param {string} params.startDate
 * @param {string} params.endDate
 * @returns {Promise<Array<{deviceType: string, visitors: number, percentage: number}>>}
 */
export const getDevices = async ({ startDate, endDate }) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT
        "deviceType" AS "deviceType",
        COUNT(DISTINCT "visitorHash") AS "visitors"
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${new Date(startDate)}
        AND "createdAt" <= ${new Date(endDate)}
        AND "eventType" = 'PAGE_VIEW'
      GROUP BY "deviceType"
      ORDER BY "visitors" DESC
    `;

    const total = result.reduce((sum, row) => sum + Number(row.visitors), 0);

    return result.map((row) => ({
      deviceType: row.deviceType,
      visitors: Number(row.visitors),
      percentage: total > 0 ? Number(((Number(row.visitors) / total) * 100).toFixed(1)) : 0,
    }));
  } catch (err) {
    logger.error('getDevices failed', { error: err.message });
    throw err;
  }
};

/**
 * Returns browser distribution.
 *
 * @param {object} params
 * @param {string} params.startDate
 * @param {string} params.endDate
 * @returns {Promise<Array<{browser: string, visitors: number, percentage: number}>>}
 */
export const getBrowsers = async ({ startDate, endDate }) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT
        "browser" AS "browser",
        COUNT(DISTINCT "visitorHash") AS "visitors"
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${new Date(startDate)}
        AND "createdAt" <= ${new Date(endDate)}
        AND "eventType" = 'PAGE_VIEW'
      GROUP BY "browser"
      ORDER BY "visitors" DESC
    `;

    const total = result.reduce((sum, row) => sum + Number(row.visitors), 0);

    return result.map((row) => ({
      browser: row.browser,
      visitors: Number(row.visitors),
      percentage: total > 0 ? Number(((Number(row.visitors) / total) * 100).toFixed(1)) : 0,
    }));
  } catch (err) {
    logger.error('getBrowsers failed', { error: err.message });
    throw err;
  }
};

/**
 * Returns project analytics (views + clicks).
 *
 * @param {object} params
 * @param {string} params.startDate
 * @param {string} params.endDate
 * @param {number} params.limit
 * @returns {Promise<Array<{slug: string, title: string, views: number, clicks: number, uniqueVisitors: number}>>}
 */
export const getProjectStats = async ({ startDate, endDate, limit = 20 }) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT
        p."slug" AS "slug",
        p."title" AS "title",
        COUNT(*) FILTER (WHERE ae."eventType" = 'PROJECT_VIEW') AS "views",
        COUNT(*) FILTER (WHERE ae."eventType" = 'PROJECT_CLICK') AS "clicks",
        COUNT(DISTINCT CASE WHEN ae."eventType" = 'PROJECT_VIEW' THEN ae."visitorHash" END) AS "uniqueVisitors"
      FROM "AnalyticsEvent" ae
      LEFT JOIN "Project" p ON ae."projectId" = p."id"
      WHERE ae."createdAt" >= ${new Date(startDate)}
        AND ae."createdAt" <= ${new Date(endDate)}
        AND ae."eventType" IN ('PROJECT_VIEW', 'PROJECT_CLICK')
        AND ae."projectId" IS NOT NULL
      GROUP BY p."id", p."slug", p."title"
      ORDER BY "views" DESC, "clicks" DESC
      LIMIT ${limit}::integer
    `;

    return result.map((row) => ({
      slug: row.slug,
      title: row.title,
      views: Number(row.views),
      clicks: Number(row.clicks),
      uniqueVisitors: Number(row.uniqueVisitors),
    }));
  } catch (err) {
    logger.error('getProjectStats failed', { error: err.message });
    throw err;
  }
};

/**
 * Returns project click breakdown (GitHub vs Demo).
 *
 * @param {object} params
 * @param {string} params.startDate
 * @param {string} params.endDate
 * @returns {Promise<Array<{slug: string, title: string, githubClicks: number, demoClicks: number, totalClicks: number}>>}
 */
export const getProjectClickBreakdown = async ({ startDate, endDate }) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT
        p."slug" AS "slug",
        p."title" AS "title",
        COUNT(*) FILTER (WHERE ae."metadata"->>'destination' = 'github') AS "githubClicks",
        COUNT(*) FILTER (WHERE ae."metadata"->>'destination' = 'demo') AS "demoClicks",
        COUNT(*) AS "totalClicks"
      FROM "AnalyticsEvent" ae
      LEFT JOIN "Project" p ON ae."projectId" = p."id"
      WHERE ae."createdAt" >= ${new Date(startDate)}
        AND ae."createdAt" <= ${new Date(endDate)}
        AND ae."eventType" = 'PROJECT_CLICK'
        AND ae."projectId" IS NOT NULL
      GROUP BY p."id", p."slug", p."title"
      ORDER BY "totalClicks" DESC
    `;

    return result.map((row) => ({
      slug: row.slug,
      title: row.title,
      githubClicks: Number(row.githubClicks),
      demoClicks: Number(row.demoClicks),
      totalClicks: Number(row.totalClicks),
    }));
  } catch (err) {
    logger.error('getProjectClickBreakdown failed', { error: err.message });
    throw err;
  }
};

/**
 * Returns referrer distribution.
 *
 * @param {object} params
 * @param {string} params.startDate
 * @param {string} params.endDate
 * @param {number} params.limit
 * @returns {Promise<Array<{source: string, visitors: number, percentage: number}>>}
 */
export const getReferrers = async ({ startDate, endDate, limit = 20 }) => {
  try {
    const result = await prisma.$queryRaw`
      WITH normalized AS (
        SELECT
          CASE
            WHEN "referrer" IS NULL OR "referrer" = '' THEN 'Direct'
            WHEN "referrer" ILIKE '%google%' THEN 'Google'
            WHEN "referrer" ILIKE '%linkedin%' THEN 'LinkedIn'
            WHEN "referrer" ILIKE '%github%' THEN 'GitHub'
            WHEN "referrer" ILIKE '%twitter%' OR "referrer" ILIKE '%x.com%' THEN 'Twitter'
            WHEN "referrer" ILIKE '%facebook%' THEN 'Facebook'
            WHEN "referrer" ILIKE '%medium%' THEN 'Medium'
            WHEN "referrer" ILIKE '%reddit%' THEN 'Reddit'
            ELSE 'Other'
          END AS "source",
          "visitorHash"
        FROM "AnalyticsEvent"
        WHERE "createdAt" >= ${new Date(startDate)}
          AND "createdAt" <= ${new Date(endDate)}
          AND "eventType" = 'PAGE_VIEW'
      )
      SELECT "source", COUNT(DISTINCT "visitorHash") AS "visitors"
      FROM normalized
      GROUP BY "source"
      ORDER BY "visitors" DESC
      LIMIT ${limit}::integer
    `;

    const total = result.reduce((sum, row) => sum + Number(row.visitors), 0);

    return result.map((row) => ({
      source: row.source,
      visitors: Number(row.visitors),
      percentage: total > 0 ? Number(((Number(row.visitors) / total) * 100).toFixed(1)) : 0,
    }));
  } catch (err) {
    logger.error('getReferrers failed', { error: err.message });
    throw err;
  }
};

/**
 * Deletes analytics events older than the specified retention period.
 * Intended for a scheduled cleanup job, not normal request handling.
 *
 * @param {number} retentionDays - Events older than this are deleted.
 * @returns {Promise<number>} Number of deleted events.
 */
export const cleanupOldEvents = async (retentionDays) => {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);

    return await prisma.analyticsEvent.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
  } catch (err) {
    logger.error('cleanupOldEvents failed', { error: err.message });
    throw err;
  }
};

export { EVENT_TYPES };
export default {
  createEvent,
  getOverview,
  getTimeSeries,
  getTopPages,
  getCountries,
  getDevices,
  getBrowsers,
  getProjectStats,
  getProjectClickBreakdown,
  getReferrers,
  cleanupOldEvents,
};
