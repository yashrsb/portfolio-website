import crypto from 'node:crypto';

/**
 * Privacy-preserving visitor identification.
 *
 * Instead of storing raw IP addresses, we derive a non-reversible hash
 * from the client IP + User-Agent, combined with a daily rotating salt.
 *
 * Design:
 * - The salt changes daily, so the same visitor receives a different
 *   hash on different days. This prevents long-term tracking across days
 *   while still allowing same-day deduplication for "unique visitors today".
 * - The IP address is never stored; only the SHA-256 hash is persisted.
 * - The raw User-Agent is never stored; only parsed fields are recorded.
 *
 * Visitor definition:
 * A "unique visitor" within a date range is identified by counting distinct
 * visitorHash values. Because the hash is daily-salted, a visitor who returns
 * on multiple days will have different hashes and be counted as separate
 * visitors on each day.
 */

const VISITOR_HASH_ALGORITHM = 'sha256';

/**
 * Returns the current UTC date as YYYY-MM-DD.
 * Using UTC ensures consistency regardless of server timezone.
 *
 * @returns {string}
 */
function getDailySaltDate() {
  const now = new Date();
  const utc = new Date(now.getTime() + now.getTimezoneOffset());
  return utc.toISOString().slice(0, 10);
}

/**
 * Generates a deterministic daily salt for visitor hashing.
 *
 * The salt incorporates:
 * 1. The current UTC date (rotates daily)
 * 2. A configurable secret (from env, or a deployment-specific value)
 *
 * This ensures the same IP+UA produces different hashes on different days,
 * while remaining deterministic within the same day.
 *
 * @returns {string}
 */
function getDailySalt() {
  const date = getDailySaltDate();
  const secret = process.env.VISITOR_HASH_SECRET || 'portfolio-default-salt';
  return `${date}:${secret}`;
}

/**
 * Generates a privacy-preserving visitor hash from IP + User-Agent.
 *
 * The hash is deterministic within a single day (same IP+UA → same hash)
 * but changes daily (different salt each day).
 *
 * @param {string} ipAddress - Client IP address (may be undefined).
 * @param {string} userAgent - Client User-Agent string (may be undefined).
 * @returns {string} SHA-256 hex hash prefixed with the date for clarity.
 */
export function generateVisitorHash(ipAddress, userAgent) {
  const salt = getDailySalt();
  const components = [
    ipAddress || 'unknown',
    userAgent || 'unknown',
    salt,
  ].join('|');

  const hash = crypto
    .createHash(VISITOR_HASH_ALGORITHM)
    .update(components)
    .digest('hex');

  return `${getDailySaltDate()}:${hash}`;
}

export default generateVisitorHash;
