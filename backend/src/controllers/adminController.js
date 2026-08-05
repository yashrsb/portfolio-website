import { adminService } from '../services/adminService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { MESSAGES } from '../constants/messages.js';

/**
 * Builds response metadata (timestamp + request id).
 * @param {object} req - Express request.
 * @returns {object} Meta object.
 */
const buildMeta = (req) => ({
  timestamp: new Date().toISOString(),
  requestId: req.id,
});

/**
 * Creates a generic set of collection + item handlers for a resource.
 * @param {object} service - Admin service slice (list/get/create/update/delete).
 * @param {string} resourceName - Human-readable resource name.
 */
/**
 * Creates a generic reorder handler bound to a service reorder method.
 * @param {(items: Array<{id: string, displayOrder: number}>) => Promise<void>} reorderFn
 * @param {string} resourceName - Human-readable resource name.
 */
const createReorderHandler = (reorderFn, resourceName) =>
  asyncHandler(async (req, res) => {
    await reorderFn(req.body.items);
    new ApiResponse(
      HTTP_STATUS.OK,
      `${resourceName} reordered successfully`,
      null,
      buildMeta(req),
    ).send(res);
  });

const createResourceController = (service, resourceName) => ({
  list: asyncHandler(async (req, res) => {
    const data = await service.list();
    new ApiResponse(
      HTTP_STATUS.OK,
      MESSAGES.RESOURCE_FETCHED,
      data,
      buildMeta(req),
    ).send(res);
  }),

  get: asyncHandler(async (req, res) => {
    const item = await service.get(req.params.id);
    if (!item) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        `${resourceName} not found`,
        'NOT_FOUND',
      );
    }
    new ApiResponse(
      HTTP_STATUS.OK,
      MESSAGES.RESOURCE_FETCHED,
      item,
      buildMeta(req),
    ).send(res);
  }),

  create: asyncHandler(async (req, res) => {
    const item = await service.create(req.body);
    new ApiResponse(
      HTTP_STATUS.CREATED,
      `${resourceName} created successfully`,
      item,
      buildMeta(req),
    ).send(res);
  }),

  update: asyncHandler(async (req, res) => {
    const item = await service.update(req.params.id, req.body);
    new ApiResponse(
      HTTP_STATUS.OK,
      `${resourceName} updated successfully`,
      item,
      buildMeta(req),
    ).send(res);
  }),

  remove: asyncHandler(async (req, res) => {
    await service.remove(req.params.id);
    new ApiResponse(
      HTTP_STATUS.OK,
      `${resourceName} deleted successfully`,
      null,
      buildMeta(req),
    ).send(res);
  }),

  reorder: createReorderHandler(service.reorder, resourceName),
});

const projects = createResourceController(
  {
    list: () => adminService.listProjects(),
    get: (id) => adminService.getProject(id),
    create: (form) => adminService.createProject(form),
    update: (id, form) => adminService.updateProject(id, form),
    remove: (id) => adminService.deleteProject(id),
    reorder: (items) => adminService.reorderProjects(items),
  },
  'Project',
);

const skills = createResourceController(
  {
    list: () => adminService.listSkills(),
    get: (id) => adminService.getSkill(id),
    create: (form) => adminService.createSkill(form),
    update: (id, form) => adminService.updateSkill(id, form),
    remove: (id) => adminService.deleteSkill(id),
    reorder: (items) => adminService.reorderSkills(items),
  },
  'Skill',
);

const experience = createResourceController(
  {
    list: () => adminService.listExperience(),
    get: (id) => adminService.getExperience(id),
    create: (form) => adminService.createExperience(form),
    update: (id, form) => adminService.updateExperience(id, form),
    remove: (id) => adminService.deleteExperience(id),
    reorder: (items) => adminService.reorderExperience(items),
  },
  'Experience',
);

const education = createResourceController(
  {
    list: () => adminService.listEducation(),
    get: (id) => adminService.getEducation(id),
    create: (form) => adminService.createEducation(form),
    update: (id, form) => adminService.updateEducation(id, form),
    remove: (id) => adminService.deleteEducation(id),
    reorder: (items) => adminService.reorderEducation(items),
  },
  'Education',
);

const certificates = createResourceController(
  {
    list: () => adminService.listCertificates(),
    get: (id) => adminService.getCertificate(id),
    create: (form) => adminService.createCertificate(form),
    update: (id, form) => adminService.updateCertificate(id, form),
    remove: (id) => adminService.deleteCertificate(id),
    reorder: (items) => adminService.reorderCertificates(items),
  },
  'Certificate',
);

const achievements = createResourceController(
  {
    list: () => adminService.listAchievements(),
    get: (id) => adminService.getAchievement(id),
    create: (form) => adminService.createAchievement(form),
    update: (id, form) => adminService.updateAchievement(id, form),
    remove: (id) => adminService.deleteAchievement(id),
    reorder: (items) => adminService.reorderAchievements(items),
  },
  'Achievement',
);

const socialLinks = createResourceController(
  {
    list: () => adminService.listSocialLinks(),
    get: (id) => adminService.getSocialLink(id),
    create: (form) => adminService.createSocialLink(form),
    update: (id, form) => adminService.updateSocialLink(id, form),
    remove: (id) => adminService.deleteSocialLink(id),
    reorder: (items) => adminService.reorderSocialLinks(items),
  },
  'Social link',
);

/**
 * Profile handlers (single record).
 */
export const getAdminProfileHandler = asyncHandler(async (req, res) => {
  const data = await adminService.getProfile();
  if (!data) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Profile not found', 'NOT_FOUND');
  }
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    data,
    buildMeta(req),
  ).send(res);
});

export const updateAdminProfileHandler = asyncHandler(async (req, res) => {
  const current = await adminService.getProfile();
  if (!current) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Profile not found', 'NOT_FOUND');
  }
  const data = await adminService.updateProfile(current.id, req.body);
  new ApiResponse(
    HTTP_STATUS.OK,
    'Profile updated successfully',
    data,
    buildMeta(req),
  ).send(res);
});

/**
 * Contact message handlers.
 */
export const listContactMessagesHandler = asyncHandler(async (req, res) => {
  const data = await adminService.listContactMessages();
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    data,
    buildMeta(req),
  ).send(res);
});

export const getContactMessageHandler = asyncHandler(async (req, res) => {
  const item = await adminService.getContactMessage(req.params.id);
  if (!item) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'Contact message not found',
      'NOT_FOUND',
    );
  }
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    item,
    buildMeta(req),
  ).send(res);
});

export const updateContactMessageHandler = asyncHandler(async (req, res) => {
  const item = await adminService.updateContactMessage(req.params.id, req.body);
  new ApiResponse(
    HTTP_STATUS.OK,
    'Contact message updated successfully',
    item,
    buildMeta(req),
  ).send(res);
});

export const deleteContactMessageHandler = asyncHandler(async (req, res) => {
  await adminService.deleteContactMessage(req.params.id);
  new ApiResponse(
    HTTP_STATUS.OK,
    'Contact message deleted successfully',
    null,
    buildMeta(req),
  ).send(res);
});

/**
 * Dashboard stats handler.
 */
export const getStatsHandler = asyncHandler(async (req, res) => {
  const data = await adminService.getStats();
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    data,
    buildMeta(req),
  ).send(res);
});

export const adminController = {
  projects,
  skills,
  experience,
  education,
  certificates,
  achievements,
  socialLinks,
};
