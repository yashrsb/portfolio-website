import { apiClient } from './apiClient';

/**
 * Maps a Prisma project record to the UI project card shape.
 * @param {object} project - Project record from the API
 * @returns {object} Project card props
 */
const toUiProject = (project) => ({
  id: project.id,
  title: project.title,
  description: project.description,
  tags: project.tags || [],
  featured: project.featured,
  status: project.status,
  githubUrl: project.githubUrl,
  liveUrl: project.demoUrl,
});

/**
 * Fetches all projects from the public API.
 * @returns {Promise<Array>} Projects array (UI shape)
 */
export async function fetchProjects() {
  const data = await apiClient.get('/projects');
  return (data || []).map(toUiProject);
}
