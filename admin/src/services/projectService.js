import BaseCrudService from './BaseCrudService';

/**
 * Project service — CRUD + reorder for the projects resource.
 * Backed by: /api/v1/admin/projects
 */
class ProjectService extends BaseCrudService {
  constructor() {
    super('projects');
  }
}

const projectService = new ProjectService();

export default projectService;
