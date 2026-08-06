import { createCrudService } from './crudService';

/**
 * Project service — CRUD + reorder for the projects resource.
 * Backed by: /api/v1/admin/projects
 */
const projectService = createCrudService('projects');

export default projectService;
