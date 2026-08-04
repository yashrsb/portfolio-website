import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import profileData from '../legacy-data/profile.js';
import projectsData from '../legacy-data/projects.js';
import experienceData from '../legacy-data/experience.js';
import skillsData from '../legacy-data/skills.js';
import {
  education as educationData,
  certificates as certificatesData,
  achievements as achievementsData,
} from '../legacy-data/education.js';
import socialData from '../legacy-data/social.js';

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

/**
 * Maps an API project object into a Prisma Project create payload.
 * @param {object} project - Mock project object.
 * @param {number} index - Position used for displayOrder.
 * @returns {object} Prisma payload.
 */
const toProjectPayload = (project, index) => ({
  slug: project.id,
  title: project.title,
  description: project.description,
  summary: null,
  imageUrl: null,
  githubUrl: project.githubUrl || null,
  demoUrl: project.liveUrl || null,
  status: project.status || 'live',
  featured: Boolean(project.featured),
  displayOrder: index,
  tags: project.tags || [],
});

/**
 * Parses "Mon YYYY" or "Mon YYYY — Present" date ranges into Date objects.
 * @param {string} raw - Raw date string.
 * @returns {{ startDate: Date, endDate: Date | null, current: boolean }}
 */
const parseExperienceDates = (raw) => {
  const [startRaw, endRaw] = raw.split('—').map((part) => part.trim());
  const startDate = new Date(`${startRaw} 01`);
  if (!endRaw || endRaw.toLowerCase() === 'present') {
    return { startDate, endDate: null, current: true };
  }
  return { startDate, endDate: new Date(`${endRaw} 01`), current: false };
};

/**
 * Maps an API experience object into a Prisma Experience create payload.
 * @param {object} item - Mock experience object.
 * @param {number} index - Position used for displayOrder.
 * @returns {object} Prisma payload.
 */
const toExperiencePayload = (item, index) => {
  const { startDate, endDate, current } = parseExperienceDates(item.date);
  return {
    company: item.company,
    companyWebsite: item.companyWebsite || null,
    role: item.role,
    startDate,
    endDate,
    current,
    location: item.location,
    description: item.description,
    technologies: item.technologies || [],
    responsibilities: item.responsibilities || [],
    achievements: item.achievements || [],
    displayOrder: index,
  };
};

/**
 * Maps the skills object into flat Prisma Skill create payloads.
 * @param {object} skills - Skills grouped by category.
 * @returns {Array} Prisma payloads.
 */
const toSkillPayloads = (skills) =>
  Object.entries(skills).flatMap(([category, items]) =>
    items.map((skill, index) => ({
      name: skill.name,
      category,
      proficiency: skill.proficiency,
      icon: skill.icon,
      displayOrder: index,
    })),
  );

/**
 * Parses "YYYY — YYYY" range into start/end years.
 * @param {string} raw - Raw date range.
 * @returns {{ startYear: number, endYear: number }}
 */
const parseEducationYears = (raw) => {
  const [start, end] = raw.split('—').map((part) => part.trim());
  return {
    startYear: Number.parseInt(start, 10),
    endYear: Number.parseInt(end, 10),
  };
};

/**
 * Maps an API education object into a Prisma Education create payload.
 * @param {object} item - Mock education object.
 * @param {number} index - Position used for displayOrder.
 * @returns {object} Prisma payload.
 */
const toEducationPayload = (item, index) => {
  const { startYear, endYear } = parseEducationYears(item.date);
  return {
    institution: item.institution,
    degree: item.degree,
    fieldOfStudy: null,
    startYear,
    endYear,
    grade: item.gpa || null,
    highlights: item.highlights || [],
    displayOrder: index,
  };
};

/**
 * Maps the social object into Prisma SocialLink create payloads.
 * @param {object} social - Flat social object.
 * @returns {Array} Prisma payloads.
 */
const toSocialLinkPayloads = (social) => {
  const order = ['email', 'phone', 'location', 'linkedin', 'github', 'twitter'];
  return order.map((platform, index) => ({
    platform,
    url: social[platform],
    displayOrder: index,
  }));
};

/**
 * Creates a Profile row from the mock profile object.
 * @returns {Promise<void>}
 */
const seedProfile = async () => {
  await prisma.profile.create({
    data: {
      name: profileData.name,
      headline: profileData.headline,
      tagline: profileData.tagline,
      bio: profileData.bio,
      interests: profileData.interests,
      goals: profileData.goals,
      strengths: profileData.strengths,
      stats: profileData.stats,
      contact: profileData.contact,
      resumeUrl: profileData.resumeUrl,
      profileImageUrl: profileData.profileImageUrl || null,
    },
  });
};

/**
 * Clears all portfolio tables so the seed can be re-run safely (idempotent).
 */
const clearTables = async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.socialLink.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.education.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.project.deleteMany();
  await prisma.profile.deleteMany();
};

/**
 * Verifies the admin credentials are present and hashes the password.
 * @returns {Promise<{name: string, email: string, passwordHash: string}>}
 */
const buildAdminPayload = async () => {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      'ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the admin user.',
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  return { name, email, passwordHash };
};

/**
 * Seeds the initial admin user from environment variables.
 * @returns {Promise<void>}
 */
const seedAdmin = async () => {
  const payload = await buildAdminPayload();
  await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      passwordHash: payload.passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });
};

/**
 * Seeds the database with the existing portfolio data.
 * Clears existing data first so the script is idempotent.
 */
async function main() {
  await clearTables();

  await prisma.project.createMany({
    data: projectsData.map(toProjectPayload),
  });

  await prisma.experience.createMany({
    data: experienceData.map(toExperiencePayload),
  });

  await prisma.skill.createMany({
    data: toSkillPayloads(skillsData),
  });

  await prisma.education.createMany({
    data: educationData.map(toEducationPayload),
  });

  await prisma.certificate.createMany({
    data: certificatesData.map((cert, index) => ({
      name: cert.name,
      issuer: cert.issuer,
      date: cert.date,
      url: cert.url || null,
      displayOrder: index,
    })),
  });

  await prisma.achievement.createMany({
    data: achievementsData.map((ach, index) => ({
      title: ach.title,
      organization: ach.organization,
      year: ach.year,
      description: ach.description,
      displayOrder: index,
    })),
  });

  await prisma.socialLink.createMany({
    data: toSocialLinkPayloads(socialData),
  });

  await seedProfile();
  await seedAdmin();

  const counts = {
    users: await prisma.user.count(),
    profiles: await prisma.profile.count(),
    projects: await prisma.project.count(),
    experiences: await prisma.experience.count(),
    skills: await prisma.skill.count(),
    educations: await prisma.education.count(),
    certificates: await prisma.certificate.count(),
    achievements: await prisma.achievement.count(),
    socialLinks: await prisma.socialLink.count(),
  };
  console.log('Seed complete:', counts);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
