import { apiClient } from './apiClient';

/**
 * Fetches social links from the public API.
 * @returns {Promise<Array>} Social links array
 */
export function fetchSocial() {
  return apiClient.get('/social');
}
