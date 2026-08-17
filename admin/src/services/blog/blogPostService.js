import apiClient from '../api/apiClient';
import BaseCrudService from '../BaseCrudService';

/**
 * BlogPostService — CRUD + publish/unpublish for blog posts.
 * Backed by: /api/v1/admin/blog/posts
 */
class BlogPostService extends BaseCrudService {
  constructor() {
    super('blog/posts', { cacheList: false });
  }

  async publish(id) {
    const { data } = await apiClient.post(`/admin/blog/posts/${id}/publish`);
    return data.data;
  }

  async unpublish(id) {
    const { data } = await apiClient.post(`/admin/blog/posts/${id}/unpublish`);
    return data.data;
  }
}

const blogPostService = new BlogPostService();

export default blogPostService;
