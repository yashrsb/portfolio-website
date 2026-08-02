import { apiClient } from './apiClient';

/**
 * Fetches the profile from the public API.
 * @returns {Promise<object>} Profile object
 */
export function fetchProfile() {
  return apiClient.get('/profile');
}
