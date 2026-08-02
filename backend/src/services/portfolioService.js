import {
  findProjects,
  findExperience,
  findSkills,
  findEducation,
  findProfile,
  findSocial,
  createContactMessage,
} from '../repositories/index.js';
import { env } from '../config/env.js';

/**
 * Business logic layer for portfolio resources.
 * Methods are async so they can later query PostgreSQL
 * through the repository without changing controllers.
 */

/**
 * Returns all projects.
 * @returns {Promise<Array>} Projects array.
 */
export const getProjects = async () => findProjects();

/**
 * Returns work experience entries.
 * @returns {Promise<Array>} Experience array.
 */
export const getExperience = async () => findExperience();

/**
 * Returns skills grouped by category.
 * @returns {Promise<object>} Skills object keyed by category.
 */
export const getSkills = async () => findSkills();

/**
 * Returns education, certificates, and achievements.
 * @returns {Promise<object>} Education bundle.
 */
export const getEducation = async () => findEducation();

/**
 * Returns profile information.
 * @returns {Promise<object>} Profile object.
 */
export const getProfile = async () => findProfile();

/**
 * Returns social links.
 * @returns {Promise<object>} Social links object.
 */
export const getSocial = async () => findSocial();

/**
 * Accepts a contact message.
 * @param {object} contact - Validated contact payload.
 * @returns {Promise<object>} Accepted contact payload.
 */
export const submitContact = async (contact) => createContactMessage(contact);

/**
 * Returns service health information.
 * @returns {Promise<object>} Health payload.
 */
export const getHealth = async () => ({
  status: 'ok',
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
  environment: env.nodeEnv,
  version: env.apiVersion,
});
