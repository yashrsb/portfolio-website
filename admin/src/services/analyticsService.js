import apiClient from './api/apiClient';
import { ADMIN_ENDPOINTS } from '../constants/api';

/**
 * Analytics service — fetches aggregated analytics data from the admin API.
 *
 * All endpoints require ADMIN authentication (handled by apiClient interceptors).
 * Data is aggregated server-side; the frontend only receives summary stats.
 */

const DEFAULT_DAYS = 30;

/**
 * Fetches all dashboard data in a single API call.
 * Returns overview (current + previous), time-series, pages, projects,
 * countries, devices, browsers, and referrers.
 *
 * @param {number} [days=30]
 * @returns {Promise<object>} Complete dashboard data.
 */
export const getDashboard = async (days = DEFAULT_DAYS) => {
  const { data } = await apiClient.get(ADMIN_ENDPOINTS.analytics.dashboard, {
    params: { days },
  });
  return data.data;
};

/**
 * Fetches the analytics overview (visitors, page views, project views/clicks, blog views)
 * for the current and previous period.
 *
 * @param {number} [days=30] - Number of days for the current period.
 * @returns {Promise<{ current: object, previous: object }>}
 */
export const getOverview = async (days = DEFAULT_DAYS) => {
  const { data } = await apiClient.get(ADMIN_ENDPOINTS.analytics.overview, {
    params: { days },
  });
  return data.data;
};

/**
 * Fetches time-series data (daily visitors + page views).
 *
 * @param {number} [days=30]
 * @returns {Promise<Array<{date: string, visitors: number, pageViews: number}>>}
 */
export const getTimeSeries = async (days = DEFAULT_DAYS) => {
  const { data } = await apiClient.get(ADMIN_ENDPOINTS.analytics.timeseries, {
    params: { days },
  });
  return data.data;
};

/**
 * Fetches top pages by view count.
 *
 * @param {number} [days=30]
 * @param {number} [limit=20]
 * @returns {Promise<Array<{path: string, views: number, uniqueVisitors: number}>>}
 */
export const getTopPages = async (days = DEFAULT_DAYS, limit = 20) => {
  const { data } = await apiClient.get(ADMIN_ENDPOINTS.analytics.pages, {
    params: { days, limit },
  });
  return data.data;
};

/**
 * Fetches country distribution.
 *
 * @param {number} [days=30]
 * @returns {Promise<Array<{country: string, visitors: number, percentage: number}>>}
 */
export const getCountries = async (days = DEFAULT_DAYS) => {
  const { data } = await apiClient.get(ADMIN_ENDPOINTS.analytics.countries, {
    params: { days },
  });
  return data.data;
};

/**
 * Fetches device type distribution.
 *
 * @param {number} [days=30]
 * @returns {Promise<Array<{deviceType: string, visitors: number, percentage: number}>>}
 */
export const getDevices = async (days = DEFAULT_DAYS) => {
  const { data } = await apiClient.get(ADMIN_ENDPOINTS.analytics.devices, {
    params: { days },
  });
  return data.data;
};

/**
 * Fetches browser distribution.
 *
 * @param {number} [days=30]
 * @returns {Promise<Array<{browser: string, visitors: number, percentage: number}>>}
 */
export const getBrowsers = async (days = DEFAULT_DAYS) => {
  const { data } = await apiClient.get(ADMIN_ENDPOINTS.analytics.browsers, {
    params: { days },
  });
  return data.data;
};

/**
 * Fetches project analytics (views, clicks, breakdown).
 *
 * @param {number} [days=30]
 * @param {number} [limit=20]
 * @returns {Promise<Array<{slug: string, title: string, views: number, clicks: number, githubClicks: number, demoClicks: number, uniqueVisitors: number}>>}
 */
export const getProjectStats = async (days = DEFAULT_DAYS, limit = 20) => {
  const { data } = await apiClient.get(ADMIN_ENDPOINTS.analytics.projects, {
    params: { days, limit },
  });
  return data.data;
};

/**
 * Fetches referrer distribution.
 *
 * @param {number} [days=30]
 * @returns {Promise<Array<{source: string, visitors: number, percentage: number}>>}
 */
export const getReferrers = async (days = DEFAULT_DAYS) => {
  const { data } = await apiClient.get(ADMIN_ENDPOINTS.analytics.referrers, {
    params: { days },
  });
  return data.data;
};

export default {
  getDashboard,
  getOverview,
  getTimeSeries,
  getTopPages,
  getCountries,
  getDevices,
  getBrowsers,
  getProjectStats,
  getReferrers,
};
