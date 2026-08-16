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
 * Fetches a single project by its slug.
 * @param {string} slug - Project slug.
 * @returns {Promise<object|null>} Project or null if not found.
 */
export const findProjectBySlug = async (slug) =>
  prisma.project.findUnique({ where: { slug } });

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
 * Creates a contact message in the database with optional metadata.
 * @param {object} contact - Validated contact payload (name, email, subject, message).
 * @param {object} [metadata={}] - Request metadata (ipAddress, userAgent).
 * @returns {Promise<object>} Created contact message.
 */
export const createContactMessage = async (contact, metadata = {}) =>
  prisma.contactMessage.create({
    data: {
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
      message: contact.message,
      ipAddress: metadata.ipAddress || null,
      userAgent: metadata.userAgent || null,
    },
  });

/**
 * Updates the email notification status for a contact message.
 * @param {string} id - Contact message id.
 * @param {object} data - Partial update payload (emailStatus, emailSentAt, emailError).
 * @returns {Promise<object>} Updated contact message.
 */
export const updateContactEmailStatus = async (id, data) =>
  prisma.contactMessage.update({
    where: { id },
    data,
  });
