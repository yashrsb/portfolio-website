/**
 * In-memory access token store.
 *
 * The access token is kept in memory (not localStorage) to reduce XSS exposure.
 * The refresh token lives in an httpOnly cookie managed by the backend, so it
 * is never accessible to JavaScript.
 */

/** @type {string|null} */
let accessToken = null;

const ACCESS_TOKEN_KEY = 'portfolio_access_token';

/**
 * @typedef {Object} User
 * @property {string} id - User id.
 * @property {string} name - Display name.
 * @property {string} email - Email address.
 * @property {'ADMIN'|'EDITOR'} role - Role.
 */

/**
 * Returns the current access token, falling back to a cached value.
 * @returns {string|null} The access token.
 */
export const getAccessToken = () => accessToken || sessionStorage.getItem(ACCESS_TOKEN_KEY);

/**
 * Stores the access token in memory and sessionStorage.
 * @param {string} token - The access token.
 */
export const setAccessToken = (token) => {
  accessToken = token;
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
};

/**
 * Clears the access token and any cached session.
 */
export const clearSession = () => {
  accessToken = null;
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
};

export default { getAccessToken, setAccessToken, clearSession };
