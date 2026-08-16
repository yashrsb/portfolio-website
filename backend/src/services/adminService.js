import {
  projectRepository,
  skillRepository,
  experienceRepository,
  educationRepository,
  certificateRepository,
  achievementRepository,
  socialLinkRepository,
  projectReorderRepository,
  skillReorderRepository,
  experienceReorderRepository,
  educationReorderRepository,
  certificateReorderRepository,
  achievementReorderRepository,
  socialLinkReorderRepository,
  getProfile,
  updateProfile,
  listContactMessages,
  getContactMessage,
  updateContactMessage,
  removeContactMessage,
  getAdminStats,
} from '../repositories/index.js';

/**
 * Business logic layer for the admin CRUD API.
 * Maps admin UI form shapes to Prisma payloads and back.
 */

// ---------------------------------------------------------------------------
// Skill category mapping (UI TitleCase ↔ DB lowercase enum)
// ---------------------------------------------------------------------------
const CATEGORY_MAP = {
  Languages: 'languages',
  Frontend: 'frontend',
  Backend: 'backend',
  Databases: 'databases',
  Cloud: 'cloud',
  Tools: 'tools',
};

const REVERSE_CATEGORY_MAP = Object.fromEntries(
  Object.entries(CATEGORY_MAP).map(([label, value]) => [value, label]),
);

// ---------------------------------------------------------------------------
// Date helpers (Experience uses "YYYY-MM" strings in the admin UI)
// ---------------------------------------------------------------------------
const parseMonth = (value) =>
  value ? new Date(`${value}-01T00:00:00.000Z`) : null;

const formatMonth = (date) =>
  date
    ? `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
    : '';

// ---------------------------------------------------------------------------
// Form → Prisma payload mappers
// ---------------------------------------------------------------------------
const toDbProject = (form) => ({
  title: form.title,
  slug: form.slug,
  summary: form.summary || null,
  description: form.description || '',
  githubUrl: form.githubUrl || null,
  demoUrl: form.demoUrl || null,
  imageUrl: form.imageUrl || null,
  status: form.status || 'live',
  featured: Boolean(form.featured),
  displayOrder: Number(form.displayOrder) || 0,
  tags: form.tags || [],
  features: form.features || [],
  techStack: form.techStack || null,
  challenges: form.challenges || [],
  lessonsLearned: form.lessonsLearned || [],
  architecture: form.architecture || null,
  architectureImage: form.architectureImage || null,
  screenshots: form.screenshots || null,
});

const toDbSkill = (form) => ({
  name: form.name,
  category: CATEGORY_MAP[form.category] || form.category,
  proficiency: Number(form.proficiency),
  icon: form.icon || '',
  displayOrder: Number(form.displayOrder) || 0,
});

const toDbExperience = (form) => {
  const current = Boolean(form.current);
  return {
    company: form.company,
    companyWebsite: form.companyWebsite || null,
    role: form.role,
    startDate: parseMonth(form.startDate),
    endDate: current ? null : parseMonth(form.endDate) || null,
    current,
    location: form.location || '',
    description: form.description || '',
    displayOrder: Number(form.displayOrder) || 0,
  };
};

const toDbEducation = (form) => {
  const payload = {
    institution: form.institution,
    degree: form.degree,
    fieldOfStudy: form.field || null,
    startYear: Number(form.startYear) || 0,
    endYear: Number(form.endYear) || 0,
    displayOrder: Number(form.displayOrder) || 0,
  };
  if (form.description) {
    payload.highlights = form.description
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return payload;
};

const toDbCertificate = (form) => ({
  name: form.name,
  issuer: form.issuer,
  date: form.year || '',
  url: form.url || null,
});

const toDbAchievement = (form) => ({
  title: form.title,
  organization: form.organization || '',
  year: Number(form.year) || 0,
  description: form.description || '',
});

const toDbSocialLink = (form) => ({
  platform: form.platform,
  url: form.url,
  icon: form.icon || null,
  displayOrder: Number(form.displayOrder) || 0,
});

// ---------------------------------------------------------------------------
// Prisma → Form shape mappers
// ---------------------------------------------------------------------------
const toFormSkill = (item) => ({
  ...item,
  category: REVERSE_CATEGORY_MAP[item.category] || item.category,
});

const toFormExperience = (item) => ({
  ...item,
  startDate: formatMonth(item.startDate),
  endDate: item.current ? '' : formatMonth(item.endDate),
});

const toFormEducation = (item) => ({
  institution: item.institution,
  degree: item.degree,
  field: item.fieldOfStudy || '',
  startYear: String(item.startYear),
  endYear: String(item.endYear),
  description: (item.highlights || []).join('\n'),
});

const toFormCertificate = (item) => ({
  name: item.name,
  issuer: item.issuer,
  year: item.date,
  url: item.url || '',
});

const toFormAchievement = (item) => ({
  ...item,
  year: String(item.year),
});

// ---------------------------------------------------------------------------
// Generic resource service factory
// ---------------------------------------------------------------------------
const createResourceService = (repository, toDb, toForm) => ({
  list: async () => {
    const items = await repository.list();
    return toForm ? items.map(toForm) : items;
  },
  get: async (id) => {
    const item = await repository.get(id);
    return item ? (toForm ? toForm(item) : item) : null;
  },
  create: async (form) => {
    const item = await repository.create(toDb(form));
    return toForm ? toForm(item) : item;
  },
  update: async (id, form) => {
    const item = await repository.update(id, toDb(form));
    return toForm ? toForm(item) : item;
  },
  remove: (id) => repository.remove(id),
});

const projectService = createResourceService(projectRepository, toDbProject);
const skillService = createResourceService(
  skillRepository,
  toDbSkill,
  toFormSkill,
);
const experienceService = createResourceService(
  experienceRepository,
  toDbExperience,
  toFormExperience,
);
const educationService = createResourceService(
  educationRepository,
  toDbEducation,
  toFormEducation,
);
const certificateService = createResourceService(
  certificateRepository,
  toDbCertificate,
  toFormCertificate,
);
const achievementService = createResourceService(
  achievementRepository,
  toDbAchievement,
  toFormAchievement,
);
const socialLinkService = createResourceService(
  socialLinkRepository,
  toDbSocialLink,
);

/**
 * Admin service exposing all CRUD operations for portfolio resources.
 */
export const adminService = {
  // Projects
  listProjects: projectService.list,
  getProject: projectService.get,
  createProject: projectService.create,
  updateProject: projectService.update,
  deleteProject: projectService.remove,

  // Skills
  listSkills: skillService.list,
  getSkill: skillService.get,
  createSkill: skillService.create,
  updateSkill: skillService.update,
  deleteSkill: skillService.remove,

  // Experience
  listExperience: experienceService.list,
  getExperience: experienceService.get,
  createExperience: experienceService.create,
  updateExperience: experienceService.update,
  deleteExperience: experienceService.remove,

  // Education
  listEducation: educationService.list,
  getEducation: educationService.get,
  createEducation: educationService.create,
  updateEducation: educationService.update,
  deleteEducation: educationService.remove,

  // Certificates
  listCertificates: certificateService.list,
  getCertificate: certificateService.get,
  createCertificate: certificateService.create,
  updateCertificate: certificateService.update,
  deleteCertificate: certificateService.remove,

  // Achievements
  listAchievements: achievementService.list,
  getAchievement: achievementService.get,
  createAchievement: achievementService.create,
  updateAchievement: achievementService.update,
  deleteAchievement: achievementService.remove,

  // Social links
  listSocialLinks: socialLinkService.list,
  getSocialLink: socialLinkService.get,
  createSocialLink: socialLinkService.create,
  updateSocialLink: socialLinkService.update,
  deleteSocialLink: socialLinkService.remove,

  // Reordering (transactional)
  reorderProjects: (items) => projectReorderRepository.reorder(items),
  reorderSkills: (items) => skillReorderRepository.reorder(items),
  reorderExperience: (items) => experienceReorderRepository.reorder(items),
  reorderEducation: (items) => educationReorderRepository.reorder(items),
  reorderCertificates: (items) => certificateReorderRepository.reorder(items),
  reorderAchievements: (items) => achievementReorderRepository.reorder(items),
  reorderSocialLinks: (items) => socialLinkReorderRepository.reorder(items),

  // Profile (single record)
  getProfile: () => getProfile(),
  updateProfile: (id, data) => updateProfile(id, data),

  // Contact messages
  listContactMessages: () => listContactMessages(),
  getContactMessage: (id) => getContactMessage(id),
  updateContactMessage: (id, data) => updateContactMessage(id, data),
  deleteContactMessage: (id) => removeContactMessage(id),

  // Dashboard stats
  getStats: () => getAdminStats(),
};
