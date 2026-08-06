import apiClient from './api/apiClient';
import { buildKey, get, set, invalidate, dedupe } from '../utils/resourceCache';

/**
 * Base CRUD service — shared implementation for every resource service.
 *
 * Concrete services only supply `endpoint` and `resourceName`, and inherit
 * list/get/create/update/remove/reorder. This removes duplicated CRUD logic
 * across ProjectService, SkillService, ExperienceService, EducationService,
 * and SocialService.
 *
 * @template T
 */
class BaseCrudService {
  /**
   * @param {string} endpoint - API path under /admin, e.g. 'projects'.
   * @param {object} [options] - Additional options.
   * @param {number} [options.cacheTtl] - Cache TTL in ms for list().
   * @param {boolean} [options.cacheList=true] - Whether list() is cached.
   */
  constructor(endpoint, options = {}) {
    this.endpoint = endpoint;
    this.resourceName = endpoint;
    this.cacheTtl = options.cacheTtl;
    this.cacheList = options.cacheList !== false;
  }

  /**
   * Builds the cache key for a list request.
   * @param {object} [query] - Query params.
   * @returns {string} The cache key.
   */
  _listKey(query = {}) {
    return buildKey(this.endpoint, query);
  }

  /**
   * Fetches a list of resources with pagination/search/sort/filter support.
   *
   * The backend may not yet expose every option, but designing the signature
   * now avoids future refactors. Unused falsy options are stripped from the
   * query string.
   * @param {object} [query] - Query options.
   * @param {number} [query.page] - Page number (1-based).
   * @param {number} [query.limit] - Items per page.
   * @param {string} [query.search] - Search term.
   * @param {string} [query.sort] - Sort field.
   * @param {'asc'|'desc'} [query.order] - Sort direction.
   * @param {object} [query.filter] - Additional filters.
   * @param {@type AbortSignal} [signal] - Cancellation signal.
   * @returns {Promise<Array<T>|object>} The list (or paginated envelope).
   */
  async list(query = {}, signal) {
    const params = { ...query };
    // Strip empty query params so they don't clutter the URL/cache key.
    Object.keys(params).forEach((key) => {
      if (
        params[key] === undefined ||
        params[key] === null ||
        params[key] === ''
      ) {
        delete params[key];
      }
    });
    if (params.filter && Object.keys(params.filter).length === 0) {
      delete params.filter;
    }

    const key = this._listKey(params);

    const cached = get(key);
    if (cached !== undefined) {
      return cached;
    }

    const request = async () => {
      const { data } = await apiClient.get(`/admin/${this.endpoint}`, {
        params,
        signal,
      });
      return data.data;
    };

    const deduped = dedupe(key, request());
    if (this.cacheList) {
      deduped.then((result) => set(key, result, this.cacheTtl));
    }
    return deduped;
  }

  /**
   * Fetches a single resource by id.
   * @param {string} id - Resource id.
   * @param {@type AbortSignal} [signal] - Cancellation signal.
   * @returns {Promise<T>} The resource.
   */
  async get(id, signal) {
    const { data } = await apiClient.get(`/admin/${this.endpoint}/${id}`, {
      signal,
    });
    return data.data;
  }

  /**
   * Creates a resource.
   * @param {object} payload - Data to create.
   * @returns {Promise<T>} The created resource.
   */
  async create(payload) {
    const { data } = await apiClient.post(`/admin/${this.endpoint}`, payload);
    invalidate(this._listKey());
    return data.data;
  }

  /**
   * Updates a resource.
   * @param {string} id - Resource id.
   * @param {object} payload - Fields to update.
   * @returns {Promise<T>} The updated resource.
   */
  async update(id, payload) {
    const { data } = await apiClient.put(
      `/admin/${this.endpoint}/${id}`,
      payload,
    );
    invalidate(this._listKey());
    return data.data;
  }

  /**
   * Removes a resource.
   * @param {string} id - Resource id.
   * @returns {Promise<object>} The server response.
   */
  async remove(id) {
    const { data } = await apiClient.delete(`/admin/${this.endpoint}/${id}`);
    invalidate(this._listKey());
    return data.data;
  }

  /**
   * Reorders resources.
   * @param {Array<{id: string, displayOrder: number}>} items - Ordered items.
   * @returns {Promise<object>} The server response.
   */
  async reorder(items) {
    const { data } = await apiClient.patch(`/admin/${this.endpoint}/reorder`, {
      items,
    });
    invalidate(this._listKey());
    return data.data;
  }

  /**
   * Invalidates the cached list entry.
   */
  invalidateCache() {
    invalidate(this._listKey());
  }
}

export default BaseCrudService;
