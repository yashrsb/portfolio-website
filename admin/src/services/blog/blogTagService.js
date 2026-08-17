import BaseCrudService from '../BaseCrudService';

/**
 * BlogTagService — CRUD for blog tags.
 * Backed by: /api/v1/admin/blog/tags
 */
class BlogTagService extends BaseCrudService {
  constructor() {
    super('blog/tags', { cacheList: false });
  }
}

const blogTagService = new BlogTagService();

export default blogTagService;
