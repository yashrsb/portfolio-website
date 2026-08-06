import BaseCrudService from './BaseCrudService';

/**
 * Experience service — CRUD + reorder for the experience resource.
 * Backed by: /api/v1/admin/experience
 */
class ExperienceService extends BaseCrudService {
  constructor() {
    super('experience');
  }
}

const experienceService = new ExperienceService();

export default experienceService;
