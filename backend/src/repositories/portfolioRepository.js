import prisma from '../lib/prisma.js';

/**
 * Repository layer — queries PostgreSQL via Prisma.
 * Services and controllers depend on this layer only.
 */

/**
 * Fetches all projects, ordered by featured then displayOrder.
 * @returns {Promise<Array>} Projects array.
 */
export const findProjects = async () =>
  prisma.project.findMany({
    orderBy: [{ featured: 'desc' }, { displayOrder: 'asc' }],
  });

/**
 * Fetches work experience entries.
 * @returns {Promise<Array>} Experience array.
 */
export const findExperience = async () =>
  prisma.experience.findMany({ orderBy: { displayOrder: 'asc' } });

/**
 * Fetches skills grouped by category.
 * @returns {Promise<object>} Skills object keyed by category.
 */
export const findSkills = async () => {
  const all = await prisma.skill.findMany({
    orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
  });
  const grouped = {};
  for (const skill of all) {
    const cat = skill.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(skill);
  }
  return grouped;
};

/**
 * Fetches education, certificates, and achievements.
 * @returns {Promise<object>} Education bundle.
 */
export const findEducation = async () => {
  const [education, certificates, achievements] = await Promise.all([
    prisma.education.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.certificate.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.achievement.findMany({ orderBy: { displayOrder: 'asc' } }),
  ]);
  return { education, certificates, achievements };
};

/**
 * Fetches profile information.
 * @returns {Promise<object|null>} Profile object.
 */
export const findProfile = async () => prisma.profile.findFirst();

/**
 * Fetches social links.
 * @returns {Promise<Array>} Social links array.
 */
export const findSocial = async () =>
  prisma.socialLink.findMany({ orderBy: { displayOrder: 'asc' } });

/**
 * Creates a contact message in the database.
 * @param {object} contact - Validated contact payload.
 * @returns {Promise<object>} Created contact message.
 */
export const createContactMessage = async (contact) =>
  prisma.contactMessage.create({ data: contact });
