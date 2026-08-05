import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from './tokenService.js';
import {
  findUserByEmail,
  findUserById,
  recordLogin,
  createRefreshToken,
  findRefreshTokenByHash,
  revokeRefreshToken,
  revokeAllUserTokens,
} from '../repositories/authRepository.js';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Builds the public user shape returned to the client.
 * @param {object} user - Prisma user record.
 * @returns {object} Safe user object.
 */
const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

/**
 * Creates a refresh token row and returns the raw token for the cookie.
 * @param {object} user - User record.
 * @returns {Promise<{token: string, maxAge: number}>} Refresh token + expiry.
 */
const issueRefreshToken = async (user) => {
  const token = generateRefreshToken();
  const ttlMs = env.auth.refreshTokenTtlDays * DAY_MS;

  await createRefreshToken({
    tokenHash: hashRefreshToken(token),
    userId: user.id,
    expiresAt: new Date(Date.now() + ttlMs),
  });

  return { token, maxAge: ttlMs };
};

/**
 * Authenticates a user with email and password.
 * Returns an access token and a refresh token (to be set as a cookie).
 *
 * @param {object} credentials - { email, password }
 * @returns {Promise<{accessToken: string, refreshToken: string, maxAge: number, user: object}>}
 * @throws {ApiError} On invalid credentials or inactive account.
 */
export const login = async ({ email, password }) => {
  const user = await findUserByEmail(email.toLowerCase());

  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated.');
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  await recordLogin(user.id);

  const accessToken = generateAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  const { token: refreshToken, maxAge } = await issueRefreshToken(user);

  return { accessToken, refreshToken, maxAge, user: toPublicUser(user) };
};

/**
 * Rotates a refresh token. The presented token is revoked and a new one issued.
 * If the presented token was already revoked (reuse), all user tokens are revoked.
 *
 * @param {string} rawToken - Refresh token from the cookie.
 * @returns {Promise<{accessToken: string, refreshToken: string, maxAge: number, user: object}>}
 * @throws {ApiError} On missing/invalid/concurrent-reuse token.
 */
export const refresh = async (rawToken) => {
  if (!rawToken) {
    throw new ApiError(401, 'Refresh token missing.');
  }

  const tokenHash = hashRefreshToken(rawToken);
  const stored = await findRefreshTokenByHash(tokenHash);

  if (!stored) {
    throw new ApiError(401, 'Invalid refresh token.');
  }

  if (stored.revokedAt) {
    // Token reuse detected — revoke the whole family.
    await revokeAllUserTokens(stored.userId);
    throw new ApiError(
      401,
      'Refresh token reuse detected. Please log in again.',
    );
  }

  if (stored.expiresAt < new Date()) {
    await revokeRefreshToken(stored.id);
    throw new ApiError(401, 'Refresh token expired. Please log in again.');
  }

  const user = await findUserById(stored.userId);
  if (!user || !user.isActive) {
    throw new ApiError(403, 'Account unavailable.');
  }

  // Rotate: revoke current, issue new.
  await revokeRefreshToken(stored.id);

  const accessToken = generateAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  const { token: newRefreshToken, maxAge } = await issueRefreshToken(user);

  // Record the replacement hash for the reuse-detection chain.
  await revokeRefreshToken(stored.id, hashRefreshToken(newRefreshToken));

  return {
    accessToken,
    refreshToken: newRefreshToken,
    maxAge,
    user: toPublicUser(user),
  };
};

/**
 * Revokes the presented refresh token (logout).
 * @param {string} rawToken - Refresh token from the cookie.
 * @returns {Promise<void>}
 */
export const logout = async (rawToken) => {
  if (!rawToken) return;
  const tokenHash = hashRefreshToken(rawToken);
  const stored = await findRefreshTokenByHash(tokenHash);
  if (stored && !stored.revokedAt) {
    await revokeRefreshToken(stored.id);
  }
};

/**
 * Resolves the current user from an access token's subject.
 * @param {string} userId - User id from the access token.
 * @returns {Promise<object>} Public user shape.
 * @throws {ApiError} When the user no longer exists or is inactive.
 */
export const getCurrentUser = async (userId) => {
  const user = await findUserById(userId);
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Account no longer available.');
  }
  return toPublicUser(user);
};
