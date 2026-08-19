/**
 * Retention cleanup script for analytics events.
 *
 * Deletes analytics events older than ANALYTICS_RETENTION_DAYS
 * (default: 90 days). Intended to be run as a scheduled job:
 *
 *   node backend/src/scripts/cleanupAnalytics.js
 *
 * or via cron:
 *
 *   0 2 * * * node /path/to/portfolio/backend/src/scripts/cleanupAnalytics.js
 *
 * This is NOT run during normal page-view requests.
 */

import prisma from '../lib/prisma.js';
import logger from '../utils/logger.js';
import { env } from '../config/env.js';

const run = async () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - env.analytics.retentionDays);

  logger.info('Analytics cleanup starting', {
    cutoff: cutoff.toISOString(),
    retentionDays: env.analytics.retentionDays,
  });

  const result = await prisma.analyticsEvent.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  logger.info('Analytics cleanup complete', {
    deletedCount: result.count,
    cutoff: cutoff.toISOString(),
  });

  await prisma.$disconnect();
  process.exit(0);
};

run().catch((err) => {
  logger.error('Analytics cleanup failed', { error: err.message });
  process.exit(1);
});
