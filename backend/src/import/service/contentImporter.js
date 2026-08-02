import prisma from '../../lib/prisma.js';

/**
 * Imports all normalized portfolio data into PostgreSQL using Prisma.
 *
 * The importer is idempotent:
 *   - Uses `upsert()` for models with natural unique keys
 *   - Uses deleteMany + createMany inside a transaction for models without
 *   - Never creates duplicates
 *
 * All operations run inside a single transaction for atomicity.
 * If any step fails, the entire import is rolled back.
 */

/**
 * Generates a displayOrder from array index.
 * @param {Array} arr
 * @returns {Array} Array with displayOrder set
 */
const withOrder = (arr) =>
  arr.map((item, index) => ({ ...item, displayOrder: index }));

/**
 * Imports the profile (single row, upserted).
 * @param {object} profile - Normalized profile payload.
 * @returns {Promise<{ action: string }>}
 */
const importProfile = async (profile) => {
  const existing = await prisma.profile.findFirst();
  if (existing) {
    await prisma.profile.update({ where: { id: existing.id }, data: profile });
  } else {
    await prisma.profile.create({ data: profile });
  }
  return { action: 'upserted' };
};

/**
 * Imports experience entries.
 * Uses deleteMany + createMany since there's no unique natural key.
 * @param {Array} items - Normalized experience payloads.
 * @returns {Promise<{ count: number }>}
 */
const importExperience = async (items) => {
  await prisma.experience.deleteMany();
  if (items.length > 0) {
    await prisma.experience.createMany({
      data: withOrder(items),
    });
  }
  return { count: items.length };
};

/**
 * Imports projects using upsert by slug, then deletes any project whose slug
 * is no longer present in the YAML so the table exactly mirrors the source.
 * @param {Array} items - Normalized project payloads.
 * @returns {Promise<{ count: number }>}
 */
const importProjects = async (items) => {
  let count = 0;
  for (const item of items) {
    await prisma.project.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
    count++;
  }

  // Remove projects not present in the source data.
  const slugs = items.map((item) => item.slug);
  await prisma.project.deleteMany({ where: { slug: { notIn: slugs } } });
  return { count };
};

/**
 * Imports skills using upsert by name+category, then deletes skills that are
 * no longer present in the YAML.
 * @param {Array} items - Normalized skill payloads.
 * @returns {Promise<{ count: number }>}
 */
const importSkills = async (items) => {
  let count = 0;
  for (const item of items) {
    await prisma.skill.upsert({
      where: { name_category: { name: item.name, category: item.category } },
      update: item,
      create: item,
    });
    count++;
  }

  // Remove skills not present in the source data.
  const keys = items.map((item) => ({
    name: item.name,
    category: item.category,
  }));
  const existing = await prisma.skill.findMany({
    select: { name: true, category: true },
  });
  const keySet = new Set(keys.map((key) => `${key.name}|${key.category}`));
  const stale = existing.filter(
    (skill) => !keySet.has(`${skill.name}|${skill.category}`),
  );
  if (stale.length > 0) {
    await prisma.skill.deleteMany({
      where: {
        OR: stale.map((skill) => ({
          name: skill.name,
          category: skill.category,
        })),
      },
    });
  }
  return { count };
};

/**
 * Imports education entries.
 * Uses deleteMany + createMany (no unique natural key).
 * @param {Array} items - Normalized education payloads.
 * @returns {Promise<{ count: number }>}
 */
const importEducation = async (items) => {
  await prisma.education.deleteMany();
  if (items.length > 0) {
    await prisma.education.createMany({
      data: withOrder(items),
    });
  }
  return { count: items.length };
};

/**
 * Imports certificate entries.
 * Uses deleteMany + createMany.
 * @param {Array} items - Normalized certificate payloads.
 * @returns {Promise<{ count: number }>}
 */
const importCertificates = async (items) => {
  await prisma.certificate.deleteMany();
  if (items.length > 0) {
    await prisma.certificate.createMany({
      data: withOrder(items),
    });
  }
  return { count: items.length };
};

/**
 * Imports achievement entries.
 * Uses deleteMany + createMany.
 * @param {Array} items - Normalized achievement payloads.
 * @returns {Promise<{ count: number }>}
 */
const importAchievements = async (items) => {
  await prisma.achievement.deleteMany();
  if (items.length > 0) {
    await prisma.achievement.createMany({
      data: withOrder(items),
    });
  }
  return { count: items.length };
};

/**
 * Imports social links using upsert by platform, then deletes platforms that
 * are no longer present in the YAML.
 * @param {Array} items - Normalized social link payloads.
 * @returns {Promise<{ count: number }>}
 */
const importSocialLinks = async (items) => {
  let count = 0;
  for (const item of items) {
    await prisma.socialLink.upsert({
      where: { platform: item.platform },
      update: item,
      create: item,
    });
    count++;
  }

  // Remove social links not present in the source data.
  const platforms = items.map((item) => item.platform);
  await prisma.socialLink.deleteMany({
    where: { platform: { notIn: platforms } },
  });
  return { count };
};

/**
 * Runs the full portfolio import inside a Prisma transaction.
 *
 * @param {object} normalized - Normalized portfolio data (all sections).
 * @returns {Promise<object>} Summary of import results.
 */
export async function importContent(normalized) {
  const summary = {};

  // Warm the connection pool before the interactive transaction.
  // Neon serverless instances cold-start in ~2.5–3s; the first query
  // must wait for that, otherwise the transaction's default 2s
  // connection-acquire timeout fires with "Unable to start a transaction".
  await prisma.$connect();

  await prisma.$transaction(
    async () => {
      // Profile (upsert single row)
      if (normalized.profile) {
        const result = await importProfile(normalized.profile);
        summary.profile = result;
      }

      // Experience
      const expResult = await importExperience(normalized.experience || []);
      summary.experience = expResult;

      // Projects
      const projResult = await importProjects(normalized.projects || []);
      summary.projects = projResult;

      // Skills
      const skillResult = await importSkills(normalized.skills || []);
      summary.skills = skillResult;

      // Education
      const eduResult = await importEducation(normalized.education || []);
      summary.education = eduResult;

      // Certificates
      const certResult = await importCertificates(
        normalized.certificates || [],
      );
      summary.certificates = certResult;

      // Achievements
      const achResult = await importAchievements(normalized.achievements || []);
      summary.achievements = achResult;

      // Social Links
      const socialResult = await importSocialLinks(
        normalized.socialLinks || [],
      );
      summary.socialLinks = socialResult;
    },
    {
      maxWait: 15000,
      timeout: 60000,
    },
  );

  return summary;
}
