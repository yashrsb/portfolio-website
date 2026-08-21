export { apiClient, ApiError, invalidateCache } from './apiClient';
export { fetchProfile } from './profileService';
export { fetchProjects, fetchProjectBySlug } from './projectService';
export { fetchExperience } from './experienceService';
export { fetchSkills } from './skillService';
export { fetchEducation } from './educationService';
export { fetchSocial } from './socialService';
export { submitContact } from './contactService';
export {
  fetchBlogPosts,
  fetchBlogPost,
  fetchFeaturedPosts,
  fetchBlogCategories,
  fetchBlogTags,
  fetchPostsByCategory,
  fetchPostsByTag,
  fetchBlogSitemapData,
  calculateReadingTime,
} from './blogService';
export {
  trackEvent,
  trackPageView,
  trackProjectView,
  trackProjectClick,
  trackBlogPostView,
} from './analyticsService.js';
