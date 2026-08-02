import morgan from 'morgan';
import logger from '../utils/logger.js';
import { env } from '../config/env.js';

/**
 * Stream adapter that routes morgan output to the logger abstraction.
 */
const stream = {
  write: (message) => {
    const trimmed = message.trim();
    if (trimmed) {
      logger.info(trimmed);
    }
  },
};

const format = env.nodeEnv === 'production' ? 'combined' : 'dev';

/**
 * HTTP request logging middleware backed by morgan.
 */
const requestLogger = morgan(format, { stream });

export default requestLogger;
