import BaseCrudService from '../BaseCrudService';

/**
 * BlogCategoryService — CRUD for blog categories.
 * Backed by: /api/v1/admin/blog/categories
 */
class BlogCategoryService extends BaseCrudService {
  constructor() {
    super('blog/categories', { cacheList: false });
  }
}

const blogCategoryService = new BlogCategoryService();

export default blogCategoryService;
