const PADDING = 7;

/**
 * Formats a log level for consistent alignment.
 * @param {string} level - Log level name.
 * @returns {string} Padded level.
 */
const formatLevel = (level) => level.toUpperCase().padEnd(PADDING);

/**
 * Creates a scoped log entry.
 * @param {string} level - Log level.
 * @param {string} message - Log message.
 * @param {object} [meta] - Additional structured data.
 */
const log = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const metaSuffix = meta ? ` ${JSON.stringify(meta)}` : '';
  const output = `${timestamp} [${formatLevel(level)}] ${message}${metaSuffix}`;

  if (level === 'error') {
    console.error(output);
  } else if (level === 'warn') {
    console.warn(output);
  } else {
    console.log(output);
  }
};

/**
 * Minimal logger abstraction. Swap console methods for
 * Pino/Winston here without changing application code.
 */
const logger = {
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),
  debug: (message, meta) => log('debug', message, meta),
};

export default logger;
