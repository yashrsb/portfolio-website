import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/index.js';

// Load the backend .env explicitly. This module is imported both by the API
// server (cwd = backend/) and by the import CLI (cwd = project root via
// `npm run import:portfolio`). Resolving from this file's location keeps
// DATABASE_URL consistent regardless of the caller's working directory.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Singleton PrismaClient configured with the PostgreSQL driver adapter.
 * Repositories are the only layer allowed to import this module.
 */
const adapter = new PrismaPg(process.env.DATABASE_URL);

const prisma = new PrismaClient({
  adapter,
  // Neon serverless instances cold-start in ~2.5–3s. Interactive
  // transactions default to maxWait=2s to acquire a connection, which
  // times out before a cold instance accepts the first query. Raise
  // bounds so the first transaction can wait for the cold start.
  transactionOptions: {
    maxWait: 15000,
    timeout: 60000,
  },
});

export default prisma;
