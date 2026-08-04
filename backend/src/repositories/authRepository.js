import prisma from '../lib/prisma.js';

/**
 * Finds a user by email address.
 * @param {string} email - User email.
 * @returns {Promise<object|null>} User record or null.
 */
export const findUserByEmail = (email) =>
  prisma.user.findUnique({ where: { email } });

/**
 * Finds a user by id.
 * @param {string} id - User id.
 * @returns {Promise<object|null>} User record or null.
 */
export const findUserById = (id) => prisma.user.findUnique({ where: { id } });

/**
 * Creates a new user record.
 * @param {object} data - User fields (name, email, passwordHash, role).
 * @returns {Promise<object>} Created user.
 */
export const createUser = (data) => prisma.user.create({ data });

/**
 * Updates a user's last login timestamp.
 * @param {string} id - User id.
 * @returns {Promise<object>} Updated user.
 */
export const recordLogin = (id) =>
  prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } });

/**
 * Persists a hashed refresh token for a user.
 * @param {object} data - Refresh token record fields.
 * @returns {Promise<object>} Created refresh token row.
 */
export const createRefreshToken = (data) =>
  prisma.refreshToken.create({ data });

/**
 * Finds a refresh token row by its hash.
 * @param {string} tokenHash - SHA-256 hash of the refresh token.
 * @returns {Promise<object|null>} Refresh token row or null.
 */
export const findRefreshTokenByHash = (tokenHash) =>
  prisma.refreshToken.findUnique({ where: { tokenHash } });

/**
 * Revokes a refresh token row.
 * @param {string} id - Refresh token row id.
 * @param {string|null} replacedBy - Hash of the replacement token, if any.
 * @returns {Promise<object>} Updated refresh token row.
 */
export const revokeRefreshToken = (id, replacedBy = null) =>
  prisma.refreshToken.update({
    where: { id },
    data: { revokedAt: new Date(), ...(replacedBy ? { replacedBy } : {}) },
  });

/**
 * Revokes all refresh tokens belonging to a user (reuse detection).
 * @param {string} userId - User id.
 * @returns {Promise<object>} Update result.
 */
export const revokeAllUserTokens = (userId) =>
  prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
