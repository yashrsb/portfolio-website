import { apiClient } from './apiClient';

/**
 * Submits a contact message.
 * @param {{ name: string, email: string, subject: string, message: string }} data
 * @returns {Promise<object>} Response data
 */
export function submitContact(data) {
  return apiClient.post('/contact', data);
}
