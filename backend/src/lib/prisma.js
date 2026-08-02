import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/index.js';

/**
 * Singleton PrismaClient configured with the PostgreSQL driver adapter.
 * Repositories are the only layer allowed to import this module.
 */
const adapter = new PrismaPg(process.env.DATABASE_URL);

const prisma = new PrismaClient({ adapter });

export default prisma;
