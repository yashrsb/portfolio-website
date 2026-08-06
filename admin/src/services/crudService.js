import apiClient from './api/apiClient';

/**
 * Factory that builds a standard CRUD + reorder service for a resource.
 *
 * Components never touch URLs; they call business methods like
 * `projects.list()`, `projects.create(payload)`, etc.
 *
 * @param {string} basePath - API path under /admin, e.g. 'projects'.
 * @returns {{
 *   list: () => Promise<Array>,
 *   get: (id: string) => Promise<object>,
 *   create: (payload: object) => Promise<object>,
 *   update: (id: string, payload: object) => Promise<object>,
 *   remove: (id: string) => Promise<object>,
 *   reorder: (items: Array<{id: string, displayOrder: number}>) => Promise<object>,
 * }} The resource service.
 */
export const createCrudService = (basePath) => {
  const list = async () => {
    const { data } = await apiClient.get(`/admin/${basePath}`);
    return data.data;
  };

  const get = async (id) => {
    const { data } = await apiClient.get(`/admin/${basePath}/${id}`);
    return data.data;
  };

  const create = async (payload) => {
    const { data } = await apiClient.post(`/admin/${basePath}`, payload);
    return data.data;
  };

  const update = async (id, payload) => {
    const { data } = await apiClient.put(`/admin/${basePath}/${id}`, payload);
    return data.data;
  };

  const remove = async (id) => {
    const { data } = await apiClient.delete(`/admin/${basePath}/${id}`);
    return data.data;
  };

  const reorder = async (items) => {
    const { data } = await apiClient.patch(`/admin/${basePath}/reorder`, {
      items,
    });
    return data.data;
  };

  return { list, get, create, update, remove, reorder };
};

export default createCrudService;
