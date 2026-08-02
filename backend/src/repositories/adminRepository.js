import prisma from '../lib/prisma.js';

/**
 * Creates a standard CRUD repository for a Prisma model.
 * @param {string} model - Prisma model name (lowercase).
 * @param {object | Array} orderBy - Default ordering for list queries.
 */
const createCrudRepository = (model, orderBy) => ({
  list: () => prisma[model].findMany({ orderBy }),
  get: (id) => prisma[model].findUnique({ where: { id } }),
  create: (data) => prisma[model].create({ data }),
  update: (id, data) => prisma[model].update({ where: { id }, data }),
  remove: (id) => prisma[model].delete({ where: { id } }),
});

export const projectRepository = createCrudRepository('project', [
  { featured: 'desc' },
  { displayOrder: 'asc' },
]);

export const skillRepository = createCrudRepository('skill', [
  { category: 'asc' },
  { displayOrder: 'asc' },
]);

export const experienceRepository = createCrudRepository('experience', {
  displayOrder: 'asc',
});

export const educationRepository = createCrudRepository('education', {
  displayOrder: 'asc',
});

export const certificateRepository = createCrudRepository('certificate', {
  displayOrder: 'asc',
});

export const achievementRepository = createCrudRepository('achievement', {
  displayOrder: 'asc',
});

export const socialLinkRepository = createCrudRepository('socialLink', {
  displayOrder: 'asc',
});

export const getProfile = () => prisma.profile.findFirst();

export const updateProfile = (id, data) =>
  prisma.profile.update({ where: { id }, data });

export const listContactMessages = () =>
  prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });

export const getContactMessage = (id) =>
  prisma.contactMessage.findUnique({ where: { id } });

export const updateContactMessage = (id, data) =>
  prisma.contactMessage.update({ where: { id }, data });

export const removeContactMessage = (id) =>
  prisma.contactMessage.delete({ where: { id } });

export const getAdminStats = async () => {
  const [
    projects,
    skills,
    experience,
    education,
    certificates,
    achievements,
    socialLinks,
    messages,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.skill.count(),
    prisma.experience.count(),
    prisma.education.count(),
    prisma.certificate.count(),
    prisma.achievement.count(),
    prisma.socialLink.count(),
    prisma.contactMessage.count(),
  ]);

  const recentProjects = await prisma.project.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      status: true,
      updatedAt: true,
    },
  });

  return {
    projects,
    skills,
    experience,
    education,
    certificates,
    achievements,
    socialLinks,
    messages,
    recentProjects,
  };
};
