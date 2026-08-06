import BaseCrudService from './BaseCrudService';

/**
 * Factory that builds a standard CRUD + reorder service for a resource.
 *
 * Kept for backward compatibility with existing callers. New code should
 * extend BaseCrudService directly (see ProjectService, SkillService, etc.).
 *
 * @param {string} basePath - API path under /admin, e.g. 'projects'.
 * @param {object} [options] - Options passed to BaseCrudService.
 * @returns {BaseCrudService} The resource service.
 */
export const createCrudService = (basePath, options) =>
  new BaseCrudService(basePath, options);

export { BaseCrudService };
export default createCrudService;
