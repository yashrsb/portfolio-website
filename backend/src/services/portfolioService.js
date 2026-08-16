import {
  findProjects,
  findExperience,
  findSkills,
  findEducation,
  findProfile,
  findSocial,
  createContactMessage,
  updateContactEmailStatus,
} from '../repositories/index.js';
import { sendContactNotification } from './emailService.js';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';

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
 * Accepts a contact message: persists it, attempts an email notification,
 * and updates the email status accordingly.
 *
 * The visitor always receives a successful response as long as the message
 * is safely stored — even if the notification email fails.
 *
 * @param {object} contact - Validated contact payload (name, email, subject, message).
 * @param {object} [metadata={}] - Request metadata (ipAddress, userAgent).
 * @returns {Promise<{id: string, createdAt: Date}>} Safe response payload.
 */
export const submitContact = async (contact, metadata = {}) => {
  const created = await createContactMessage(contact, metadata);

  logger.info('Contact submission accepted', {
    messageId: created.id,
    ipAddress: metadata.ipAddress,
  });

  try {
    await sendContactNotification({
      name: created.name,
      email: created.email,
      subject: created.subject,
      message: created.message,
      createdAt: created.createdAt.toISOString(),
      ipAddress: created.ipAddress,
    });

    await updateContactEmailStatus(created.id, {
      emailStatus: 'sent',
      emailSentAt: new Date(),
      emailError: null,
    });

    logger.info('Contact notification email sent', {
      messageId: created.id,
    });
  } catch (error) {
    logger.error('Contact notification email failed', {
      messageId: created.id,
      error: error.message,
    });

    try {
      await updateContactEmailStatus(created.id, {
        emailStatus: 'failed',
        emailError: error.message,
      });
    } catch (dbError) {
      logger.error('Failed to update email status in database', {
        messageId: created.id,
        error: dbError.message,
      });
    }
  }

  return { id: created.id, createdAt: created.createdAt };
};

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
