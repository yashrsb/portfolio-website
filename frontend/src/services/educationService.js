import { apiClient } from './apiClient';

/**
 * Maps a Prisma education record to the UI shape.
 * @param {object} item - Education record from the API
 * @returns {object} Education UI shape
 */
const toUiEducation = (item) => ({
  institution: item.institution,
  degree: item.degree,
  date: `${item.startYear} — ${item.endYear}`,
  gpa: item.grade || '',
  highlights: item.highlights || [],
});

/**
 * Fetches education bundle (education, certificates, achievements) from the public API.
 * @returns {Promise<{education: Array, certificates: Array, achievements: Array}>}
 */
export async function fetchEducation() {
  const data = await apiClient.get('/education');
  return {
    education: (data?.education || []).map(toUiEducation),
    certificates: data?.certificates || [],
    achievements: data?.achievements || [],
  };
}
