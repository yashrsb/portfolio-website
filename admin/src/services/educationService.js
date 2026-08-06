import { createCrudService } from './crudService';

/**
 * Education service — CRUD + reorder for the education resource.
 * Backed by: /api/v1/admin/education
 */
const educationService = createCrudService('education');

export default educationService;
