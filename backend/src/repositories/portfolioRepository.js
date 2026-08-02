import * as data from '../data/index.js';

/**
 * Repository layer. Currently returns mock data directly,
 * but is isolated so it can later query PostgreSQL without
 * changing services or controllers.
 */

/**
 * Fetches all projects.
 * @returns {Promise<Array>} Projects array.
 */
export const findProjects = async () => data.projects;

/**
 * Fetches work experience entries.
 * @returns {Promise<Array>} Experience array.
 */
export const findExperience = async () => data.experience;

/**
 * Fetches skills grouped by category.
 * @returns {Promise<object>} Skills object keyed by category.
 */
export const findSkills = async () => data.skills;

/**
 * Fetches education, certificates, and achievements.
 * @returns {Promise<object>} Education bundle.
 */
export const findEducation = async () => ({
  education: data.education,
  certificates: data.certificates,
  achievements: data.achievements,
});

/**
 * Fetches profile information.
 * @returns {Promise<object>} Profile object.
 */
export const findProfile = async () => data.profile;

/**
 * Fetches social links.
 * @returns {Promise<object>} Social links object.
 */
export const findSocial = async () => data.social;

/**
 * Accepts a contact message.
 * Mock operation — returns the payload unchanged.
 * @param {object} contact - Validated contact payload.
 * @returns {Promise<object>} Accepted contact payload.
 */
export const createContactMessage = async (contact) => contact;
