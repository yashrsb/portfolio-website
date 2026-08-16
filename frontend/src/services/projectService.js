import { apiClient } from './apiClient';

/**
 * Fetches all projects from the public API.
 * @returns {Promise<Array>} Projects array (UI shape)
 */
export async function fetchProjects() {
  const data = await apiClient.get('/projects');
  return (data || []).map(toUiProject);
}

/**
 * Fetches a single project by slug from the public API.
 * @param {string} slug - Project slug.
 * @returns {Promise<object>} Full project object (UI shape).
 */
export async function fetchProjectBySlug(slug) {
  const data = await apiClient.get(`/projects/${slug}`);
  return toUiProjectDetail(data);
}

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
  slug: project.slug,
  imageUrl: project.imageUrl,
});

/**
 * Maps a Prisma project record to the full detail-page shape.
 * @param {object} project - Project record from the API
 * @returns {object} Full project detail object
 */
const toUiProjectDetail = (project) => ({
  id: project.id,
  slug: project.slug,
  title: project.title,
  description: project.description,
  summary: project.summary,
  imageUrl: project.imageUrl,
  githubUrl: project.githubUrl,
  demoUrl: project.demoUrl,
  status: project.status,
  featured: project.featured,
  displayOrder: project.displayOrder,
  tags: project.tags || [],
  features: project.features || [],
  techStack: project.techStack || null,
  challenges: project.challenges || [],
  lessonsLearned: project.lessonsLearned || [],
  architecture: project.architecture,
  architectureImage: project.architectureImage,
  screenshots: project.screenshots || [],
});
