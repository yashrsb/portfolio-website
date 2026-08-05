import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DEFAULT_PORT = 5000;
const DEFAULT_NODE_ENV = 'development';
const DEFAULT_API_PREFIX = '/api/v1';
const DEFAULT_FRONTEND_URL = 'http://localhost:5173';
const DEFAULT_ACCESS_TOKEN_TTL = '15m';
const DEFAULT_REFRESH_TOKEN_TTL_DAYS = 7;
const DEFAULT_ADMIN_EMAIL = 'admin@example.com';
const DEFAULT_ADMIN_NAME = 'Admin';

const VALID_ENVIRONMENTS = ['development', 'production', 'test'];

/**
 * Parses and validates the PORT value.
 * @param {string} value - Raw PORT environment value.
 * @returns {number} Validated port number.
 */
const parsePort = (value) => {
  const port = Number.parseInt(value, 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    throw new Error(
      `Invalid PORT value: "${value}". Expected a number between 1 and 65535.`,
    );
  }
  return port;
};

const nodeEnv = process.env.NODE_ENV || DEFAULT_NODE_ENV;

if (!VALID_ENVIRONMENTS.includes(nodeEnv)) {
  throw new Error(
    `Invalid NODE_ENV value: "${nodeEnv}". Expected one of ${VALID_ENVIRONMENTS.join(', ')}.`,
  );
}

if (nodeEnv === 'production' && !process.env.FRONTEND_URL) {
  throw new Error('FRONTEND_URL is required when NODE_ENV=production.');
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required.');
}

if (!process.env.JWT_ACCESS_SECRET) {
  throw new Error('JWT_ACCESS_SECRET is required.');
}

if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error('JWT_REFRESH_SECRET is required.');
}

/**
 * Validated application configuration derived from environment variables.
 * Fails fast on startup when values are invalid.
 */
export const env = {
  port: parsePort(process.env.PORT || String(DEFAULT_PORT)),
  nodeEnv,
  apiPrefix: process.env.API_PREFIX || DEFAULT_API_PREFIX,
  frontendUrl: process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL,
  apiVersion: 'v1',
  auth: {
    accessTokenTtl:
      process.env.JWT_ACCESS_SECRET_TTL || DEFAULT_ACCESS_TOKEN_TTL,
    refreshTokenTtlDays: Number.parseInt(
      process.env.JWT_REFRESH_SECRET_TTL_DAYS ||
        String(DEFAULT_REFRESH_TOKEN_TTL_DAYS),
      10,
    ),
    refreshTokenCookieName:
      process.env.REFRESH_TOKEN_COOKIE_NAME || 'portfolio_refresh',
    cookieSecure: process.env.COOKIE_SECURE === 'true',
    cookieSameSite: (process.env.COOKIE_SAME_SITE || 'lax').toLowerCase(), // 'lax' | 'strict' | 'none'
    accessTokenSecret: process.env.JWT_ACCESS_SECRET,
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
    admin: {
      name: process.env.ADMIN_NAME || DEFAULT_ADMIN_NAME,
      email: process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL,
    },
  },
};

if (nodeEnv === 'production') {
  logger.warn(
    'Using default values for unset environment variables. Verify production configuration.',
  );
}
