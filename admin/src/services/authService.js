import apiClient from './api/apiClient';
import { setAccessToken, clearSession } from './tokenStore';

/**
 * Authentication service — exposes business methods for the auth lifecycle.
 * Components never call the API directly and never read URLs.
 */

/**
 * Logs a user in and stores the returned access token.
 * The refresh token is set as an httpOnly cookie by the backend.
 * @param {string} email - User email.
 * @param {string} password - User password.
 * @returns {Promise<import('./types.js').User>} The authenticated user.
 */
export const login = async (email, password) => {
  const { data } = await apiClient.post('/auth/login', { email, password });
  setAccessToken(data.data.accessToken);
  return data.data.user;
};

/**
 * Logs the current user out and clears local session state.
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    clearSession();
  }
};

/**
 * Fetches the currently authenticated user.
 * @returns {Promise<import('./types.js').User>} The current user.
 */
export const me = async () => {
  const { data } = await apiClient.get('/auth/me');
  return data.data.user;
};

export default { login, logout, me };
