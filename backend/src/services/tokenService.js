import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

/**
 * Generates a JWT access token for the given user payload.
 *
 * @param {object} payload - Token payload (sub, email, role).
 * @returns {string} Signed JWT access token.
 */
export function generateAccessToken(payload) {
  return jwt.sign(payload, env.auth.accessTokenSecret, {
    expiresIn: env.auth.accessTokenTtl,
    issuer: 'portfolio-api',
    audience: 'portfolio-admin',
  });
}

/**
 * Verifies and decodes a JWT access token.
 *
 * @param {string} token - The JWT access token.
 * @returns {object} Decoded token payload.
 * @throws {Error} When the token is invalid or expired.
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, env.auth.accessTokenSecret, {
    issuer: 'portfolio-api',
    audience: 'portfolio-admin',
  });
}

/**
 * Generates a cryptographically random refresh token.
 *
 * @returns {string} Opaque refresh token (48 random bytes, base64url).
 */
export function generateRefreshToken() {
  return crypto.randomBytes(48).toString('base64url');
}

/**
 * Hashes a refresh token using SHA-256.
 * Only the hash is persisted; the raw token is returned to the client.
 *
 * @param {string} token - Raw refresh token.
 * @returns {string} SHA-256 hex digest.
 */
export function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

