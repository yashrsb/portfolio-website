import BaseCrudService from './BaseCrudService';

/**
 * Social links service — CRUD + reorder for the social-links resource.
 * Backed by: /api/v1/admin/social-links
 */
class SocialService extends BaseCrudService {
  constructor() {
    super('social-links');
  }
}

const socialService = new SocialService();

export default socialService;
