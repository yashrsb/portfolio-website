import { createCrudService } from './crudService';

/**
 * Experience service — CRUD + reorder for the experience resource.
 * Backed by: /api/v1/admin/experience
 */
const experienceService = createCrudService('experience');

export default experienceService;
