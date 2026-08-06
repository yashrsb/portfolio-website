import BaseCrudService from './BaseCrudService';

/**
 * Skill service — CRUD + reorder for the skills resource.
 * Backed by: /api/v1/admin/skills
 */
class SkillService extends BaseCrudService {
  constructor() {
    super('skills');
  }
}

const skillService = new SkillService();

export default skillService;
