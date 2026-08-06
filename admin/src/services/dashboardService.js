import apiClient from './api/apiClient';
import { ADMIN_ENDPOINTS } from '../constants/api';

/**
 * Dashboard service — aggregates admin statistics and profile data.
 * Backed by: /api/v1/admin/stats and /api/v1/admin/profile
 */

/**
 * Fetches dashboard statistics.
 * @returns {Promise<object>} Stats object.
 */
export const getStats = async () => {
  const { data } = await apiClient.get(ADMIN_ENDPOINTS.stats);
  return data.data;
};

/**
 * Fetches the admin profile.
 * @returns {Promise<object>} Profile object.
 */
export const getProfile = async () => {
  const { data } = await apiClient.get(ADMIN_ENDPOINTS.profile);
  return data.data;
};

/**
 * Updates the admin profile.
 * @param {object} payload - Profile fields to update.
 * @returns {Promise<object>} The updated profile.
 */
export const updateProfile = async (payload) => {
  const { data } = await apiClient.put(ADMIN_ENDPOINTS.profile, payload);
  return data.data;
};

export default { getStats, getProfile, updateProfile };
