import prisma from '../lib/prisma.js';

/**
 * Single-purpose repository for the ResumeFile model.
 * Handles only ResumeFile persistence — profile coordination
 * lives in the service layer.
 */

/**
 * Creates a resume file record.
 * @param {object} data - Resume metadata.
 * @returns {Promise<object>} Created resume record.
 */
export const createResume = (data) => prisma.resumeFile.create({ data });

/**
 * Finds a resume file by id.
 * @param {string} id - Resume id.
 * @returns {Promise<object|null>} Resume record or null.
 */
export const findResumeById = (id) =>
  prisma.resumeFile.findUnique({ where: { id } });

/**
 * Retrieves the latest resume by upload timestamp.
 * @returns {Promise<object|null>} Most recent resume or null.
 */
export const findLatestResume = () =>
  prisma.resumeFile.findFirst({ orderBy: { uploadedAt: 'desc' } });

/**
 * Updates a resume file record.
 * @param {string} id - Resume id.
 * @param {object} data - Fields to update.
 * @returns {Promise<object>} Updated resume record.
 */
export const updateResume = (id, data) =>
  prisma.resumeFile.update({ where: { id }, data });

/**
 * Deletes a resume file record.
 * @param {string} id - Resume id.
 * @returns {Promise<object>} Deleted resume record.
 */
export const deleteResume = (id) => prisma.resumeFile.delete({ where: { id } });
