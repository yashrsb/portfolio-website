import { createCrudService } from './crudService';

/**
 * Skill service — CRUD + reorder for the skills resource.
 * Backed by: /api/v1/admin/skills
 */
const skillService = createCrudService('skills');

export default skillService;
