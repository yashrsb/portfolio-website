import storage from '../storage/index.js';
import {
  createResume,
  findLatestResume,
  findResumeById,
  updateResume,
  deleteResume,
} from '../repositories/resumeRepository.js';
import { getProfile, updateProfile } from '../repositories/adminRepository.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Coordinates resume file storage and ResumeFile/profile persistence.
 * Business logic here never touches the filesystem directly — it only
 * talks to the StorageService abstraction.
 */

/**
 * Builds the public download URL for a resume.
 * @returns {Promise<string>} Public URL.
 */
const buildPublicUrl = () => storage.getPublicUrl();

/**
 * Updates the Profile.resumeUrl to point at the latest public URL.
 * @returns {Promise<object>} Updated profile.
 */
const syncProfileResumeUrl = async () => {
  const profile = await getProfile();
  if (!profile) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'Profile not found',
      ERROR_CODES.NOT_FOUND,
    );
  }
  const publicUrl = await buildPublicUrl();
  return updateProfile(profile.id, { resumeUrl: publicUrl });
};

/**
 * Clears the Profile.resumeUrl back to its default placeholder.
 * @returns {Promise<object>} Updated profile.
 */
const clearProfileResumeUrl = async () => {
  const profile = await getProfile();
  if (!profile) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'Profile not found',
      ERROR_CODES.NOT_FOUND,
    );
  }
  return updateProfile(profile.id, { resumeUrl: '#' });
};

/**
 * Uploads a new resume: validates, persists, records metadata, and
 * updates Profile.resumeUrl.
 * @param {object} file - Multer file object.
 * @returns {Promise<object>} Stored resume metadata + public URL.
 */
export const uploadResume = async (file) => {
  await storage.validate(file);

  const stored = await storage.upload(file);
  const publicUrl = await buildPublicUrl();

  const resume = await createResume({
    filename: file.originalname,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: stored.size,
    storageKey: stored.storageKey,
    storagePath: stored.storagePath,
    storedName: stored.storedName,
    url: publicUrl,
  });

  await syncProfileResumeUrl();

  return { resume, publicUrl };
};

/**
 * Replaces the existing resume. Orchestrates upload + delete within the
 * service while keeping the StorageService primitive.
 * @param {object} file - Multer file object.
 * @returns {Promise<object>} Replaced resume metadata + public URL.
 */
export const replaceResume = async (file) => {
  await storage.validate(file);

  const existing = await findLatestResume();
  if (!existing) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'No resume exists to replace',
      ERROR_CODES.FILE_NOT_FOUND,
    );
  }

  const stored = await storage.upload(file);
  const publicUrl = await buildPublicUrl();

  const resume = await updateResume(existing.id, {
    filename: file.originalname,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: stored.size,
    storageKey: stored.storageKey,
    storagePath: stored.storagePath,
    storedName: stored.storedName,
    url: publicUrl,
  });

  // Remove the previous file from storage after the new one is persisted.
  await storage.delete(existing.storageKey);

  await syncProfileResumeUrl();

  return { resume, publicUrl };
};

/**
 * Deletes the latest resume and clears Profile.resumeUrl.
 * @returns {Promise<void>}
 */
export const deleteResumeRecord = async () => {
  const latest = await findLatestResume();
  if (!latest) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'No resume exists to delete',
      ERROR_CODES.FILE_NOT_FOUND,
    );
  }

  await storage.delete(latest.storageKey);
  await deleteResume(latest.id);
  await clearProfileResumeUrl();
};

/**
 * Returns the latest resume metadata for admin consumption.
 * @returns {Promise<object|null>} Latest resume metadata.
 */
export const getResumeMetadata = async () => findLatestResume();

/**
 * Returns the latest resume metadata for public download.
 * @returns {Promise<object>} Latest resume record.
 */
export const getPublicResume = async () => {
  const latest = await findLatestResume();
  if (!latest) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'No resume is available',
      ERROR_CODES.FILE_NOT_FOUND,
    );
  }
  return latest;
};

/**
 * Retrieves a resume by id (used by the download controller).
 * @param {string} id - Resume id.
 * @returns {Promise<object>} Resume record.
 */
export const getResumeById = async (id) => findResumeById(id);
