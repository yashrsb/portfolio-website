import apiClient from './api/apiClient';
import { ADMIN_ENDPOINTS } from '../constants/api';

/**
 * Resume service — manages the single resume file.
 * Backed by: /api/v1/admin/resume
 */

/**
 * Fetches the resume metadata.
 * @returns {Promise<object|null>} Resume metadata or null when none exists.
 */
export const getResume = async () => {
  const { data } = await apiClient.get(ADMIN_ENDPOINTS.resume);
  return data.data;
};

/**
 * Uploads a new resume file (multipart).
 * @param {File} file - The PDF file to upload.
 * @returns {Promise<object>} The new resume record.
 */
export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  const { data } = await apiClient.post(ADMIN_ENDPOINTS.resume, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

/**
 * Replaces the existing resume file (multipart).
 * @param {File} file - The PDF file to upload.
 * @returns {Promise<object>} The replaced resume record.
 */
export const replaceResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  const { data } = await apiClient.put(ADMIN_ENDPOINTS.resume, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

/**
 * Deletes the resume file and clears the profile reference.
 * @returns {Promise<void>}
 */
export const deleteResume = async () => {
  await apiClient.delete(ADMIN_ENDPOINTS.resume);
};

export default { getResume, uploadResume, replaceResume, deleteResume };
