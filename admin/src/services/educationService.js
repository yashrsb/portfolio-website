import BaseCrudService from './BaseCrudService';

/**
 * Education service — CRUD + reorder for the education resource.
 * Backed by: /api/v1/admin/education
 */
class EducationService extends BaseCrudService {
  constructor() {
    super('education');
  }
}

const educationService = new EducationService();

export default educationService;
