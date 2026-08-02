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
};

if (nodeEnv === 'production') {
  logger.warn(
    'Using default values for unset environment variables. Verify production configuration.',
  );
}
