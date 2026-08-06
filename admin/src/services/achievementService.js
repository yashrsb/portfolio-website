import BaseCrudService from './BaseCrudService';

/**
 * Achievement service — CRUD + reorder for the achievements resource.
 * Backed by: /api/v1/admin/achievements
 */
class AchievementService extends BaseCrudService {
  constructor() {
    super('achievements');
  }
}

const achievementService = new AchievementService();

export default achievementService;
