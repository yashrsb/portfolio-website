#!/usr/bin/env node

/**
 * Production-safe admin user seed script.
 *
 * Creates the admin user from environment variables if it does not already exist.
 * Idempotent: safe to run repeatedly without creating duplicates.
 *
 * Environment variables required:
 *   ADMIN_NAME     - Admin display name
 *   ADMIN_EMAIL    - Admin email address (unique identifier)
 *   ADMIN_PASSWORD - Admin plaintext password (hashed before storage)
 *
 * Usage:
 *   node scripts/seed-admin.js
 */

import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL),
});

async function seedAdmin() {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error(
      'ERROR: ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be set.',
    );
    process.exit(1);
  }

  const normalizedEmail = email.toLowerCase();

  // Check if admin user already exists
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true, role: true },
  });

  if (existing) {
    console.log(`Admin user already exists: ${existing.email} (${existing.role})`);
    console.log('No changes made. Operation is idempotent.');
    return existing;
  }

  // Hash password and create admin user
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  console.log('Admin user created successfully:');
  console.log(`  ID: ${admin.id}`);
  console.log(`  Name: ${admin.name}`);
  console.log(`  Email: ${admin.email}`);
  console.log(`  Role: ${admin.role}`);
  console.log(`  Created: ${admin.createdAt}`);

  return admin;
}

seedAdmin()
  .catch((error) => {
    console.error('Failed to seed admin user:', error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
