import { apiClient } from './apiClient';

/**
 * Fetches skills from the public API.
 * @returns {Promise<object>} Skills object keyed by category
 */
export function fetchSkills() {
  return apiClient.get('/skills');
}
