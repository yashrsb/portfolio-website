import {
  getProjects,
  getExperience,
  getSkills,
  getEducation,
  getProfile,
  getSocial,
  submitContact,
  getHealth,
} from '../services/index.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
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
 * Handles GET /health.
 */
export const getHealthHandler = asyncHandler(async (req, res) => {
  const data = await getHealth();
  new ApiResponse(
    HTTP_STATUS.OK,
    'Health check successful',
    data,
    buildMeta(req),
  ).send(res);
});

/**
 * Handles GET /projects.
 */
export const getProjectsHandler = asyncHandler(async (req, res) => {
  const data = await getProjects();
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    data,
    buildMeta(req),
  ).send(res);
});

/**
 * Handles GET /experience.
 */
export const getExperienceHandler = asyncHandler(async (req, res) => {
  const data = await getExperience();
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    data,
    buildMeta(req),
  ).send(res);
});

/**
 * Handles GET /skills.
 */
export const getSkillsHandler = asyncHandler(async (req, res) => {
  const data = await getSkills();
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    data,
    buildMeta(req),
  ).send(res);
});

/**
 * Handles GET /education.
 */
export const getEducationHandler = asyncHandler(async (req, res) => {
  const data = await getEducation();
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    data,
    buildMeta(req),
  ).send(res);
});

/**
 * Handles GET /profile.
 */
export const getProfileHandler = asyncHandler(async (req, res) => {
  const data = await getProfile();
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    data,
    buildMeta(req),
  ).send(res);
});

/**
 * Handles GET /social.
 */
export const getSocialHandler = asyncHandler(async (req, res) => {
  const data = await getSocial();
  new ApiResponse(
    HTTP_STATUS.OK,
    MESSAGES.RESOURCE_FETCHED,
    data,
    buildMeta(req),
  ).send(res);
});

/**
 * Handles POST /contact.
 */
export const postContactHandler = asyncHandler(async (req, res) => {
  const data = await submitContact(req.body);
  new ApiResponse(
    HTTP_STATUS.ACCEPTED,
    MESSAGES.CONTACT_RECEIVED,
    data,
    buildMeta(req),
  ).send(res);
});
