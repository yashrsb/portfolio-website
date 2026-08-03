import { apiClient } from './apiClient';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Formats an ISO date string as "Mon YYYY" (e.g., "Jan 2022").
 * @param {string} iso - ISO date string
 * @returns {string} Formatted month + year
 */
const formatMonth = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
};

/**
 * Maps a Prisma experience record to the UI shape.
 * @param {object} item - Experience record from the API
 * @returns {object} Experience UI shape
 */
const toUiExperience = (item) => ({
  company: item.company,
  companyWebsite: item.companyWebsite || null,
  role: item.role,
  date: `${formatMonth(item.startDate)} — ${
    item.current ? 'Present' : formatMonth(item.endDate)
  }`,
  location: item.location,
  description: item.description,
  technologies: item.technologies || [],
  responsibilities: item.responsibilities || [],
  achievements: item.achievements || [],
});

/**
 * Fetches work experience entries from the public API.
 * @returns {Promise<Array>} Experience array (UI shape)
 */
export async function fetchExperience() {
  const data = await apiClient.get('/experience');
  return (data || []).map(toUiExperience);
}
