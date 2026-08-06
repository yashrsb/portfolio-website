import { createCrudService } from './crudService';

/**
 * Social links service — CRUD + reorder for the social-links resource.
 * Backed by: /api/v1/admin/social-links
 */
const socialService = createCrudService('social-links');

export default socialService;
