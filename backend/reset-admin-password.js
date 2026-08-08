import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './src/generated/prisma/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, './.env') });

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

/**
 * Resets the admin user's email and passwordHash from backend/.env.
 * Preserves all portfolio data; only the admin user + their refresh tokens
 * are updated. All existing refresh tokens are revoked so old sessions
 * are invalidated after the credential change.
 */
async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in backend/.env.');
  }

  const existing = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  if (!existing) {
    throw new Error('No ADMIN user found. Run `npm run db:seed` to seed the admin.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const updated = await prisma.user.update({
    where: { id: existing.id },
    data: { email, passwordHash },
  });

  // Invalidate all existing refresh tokens so old sessions are revoked.
  await prisma.refreshToken.updateMany({
    where: { userId: existing.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  console.log('Admin credential reset complete:');
  console.log(`  id:    ${updated.id}`);
  console.log(`  name:  ${updated.name}`);
  console.log(`  email: ${updated.email}`);
  console.log(`  role:  ${updated.role}`);
  console.log('All existing refresh tokens were revoked.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Admin reset failed:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  });
