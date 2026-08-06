import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { normalizeApiError } from '../utils/apiErrors';

/** Default toast copy keyed by operation. */
const TOAST_MESSAGES = {
  create: 'Created successfully',
  update: 'Updated successfully',
  remove: 'Deleted successfully',
  reorder: 'Order updated',
};

/**
 * useResource — manages a collection backed by a CRUD service.
 *
 * Provides loading/error state, CRUD helpers, optimistic updates with
 * rollback, and automatic toasts. Pages only need:
 *   const { data, loading, error, create, update, remove, reorder, refresh } =
 *     useResource(projectService);
 *
 * @template T
 * @param {{
 *   list: () => Promise<Array<T>>,
 *   create: (payload: object) => Promise<T>,
 *   update: (id: string, payload: object) => Promise<T>,
 *   remove: (id: string) => Promise<object>,
 *   reorder: (items: Array<object>) => Promise<object>,
 * }} service - The resource service (from createCrudService).
 * @param {object} [options] - Configuration.
 * @param {boolean} [options.autoLoad=true] - Fetch data on mount.
 * @param {object} [options.toasts] - Custom toast messages per operation.
 * @param {object} [options.toasts.create] - Custom create message.
 * @param {object} [options.toasts.update] - Custom update message.
 * @param {object} [options.toasts.remove] - Custom remove message.
 * @param {object} [options.toasts.reorder] - Custom reorder message.
 * @returns {{
 *   data: Array<T>,
 *   loading: boolean,
 *   refreshing: boolean,
 *   error: import('../services/types.js').ApiError|null,
 *   create: (payload: object) => Promise<T|null>,
 *   update: (id: string, payload: object) => Promise<T|null>,
 *   remove: (id: string) => Promise<boolean>,
 *   reorder: (items: Array<object>) => Promise<boolean>,
 *   refresh: () => Promise<void>,
 *   clearError: () => void,
 * }}
 */
function useResource(service, options = {}) {
  const { autoLoad = true, toasts = {} } = options;
  const { showToast } = useToast();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(autoLoad);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Loads the collection. Sets `loading` the first time and `refreshing`
   * on subsequent calls.
   * @param {boolean} isRefresh - Whether this is a background refresh.
   */
  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const result = await service.list();
        if (mountedRef.current) {
          setData(result || []);
        }
      } catch (err) {
        if (mountedRef.current) {
          const normalized = normalizeApiError(err);
          setError(normalized);
          if (normalized.isAuthError) {
            showToast('error', 'Your session has expired. Please log in again.');
          }
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [service, showToast],
  );

  // Initial fetch.
  useEffect(() => {
    if (autoLoad) {
      load();
    }
  }, [autoLoad, load]);

  /**
   * Applies an optimistic mutation and rolls back on failure.
   * @template R
   * @param {() => Promise<R>} request - The service call.
   * @param {{ optimistic: () => void, rollback: () => void, success: (result: R) => void }} handlers
   */
  const runMutation = useCallback(
    async (request, handlers) => {
      setError(null);
      handlers.optimistic();
      try {
        const result = await request();
        if (mountedRef.current) {
          handlers.success(result);
        }
        return result;
      } catch (err) {
        const normalized = normalizeApiError(err);
        if (mountedRef.current) {
          handlers.rollback();
          setError(normalized);
          if (normalized.isNetworkError) {
            showToast(
              'error',
              'Network error. Please check your connection and try again.',
            );
          } else if (normalized.fieldErrors.length > 0) {
            showToast('error', 'Please fix the validation errors.');
          } else {
            showToast('error', normalized.message);
          }
        }
        return null;
      }
    },
    [showToast],
  );

  /**
   * Creates a new item, applying optimistic UI and a success toast.
   * @param {object} payload - Data to create.
   * @returns {Promise<T|null>} The created item or null on error.
   */
  const create = useCallback(
    (payload) => {
      const tempId = `temp-${Date.now()}`;
      const optimisticItem = { ...payload, id: tempId };
      return runMutation(
        () => service.create(payload),
        {
          optimistic: () =>
            setData((prev) => [...prev, optimisticItem]),
          rollback: () =>
            setData((prev) => prev.filter((item) => item.id !== tempId)),
          success: (created) =>
            setData((prev) =>
              prev.map((item) =>
                item.id === tempId ? { ...item, ...created, id: created.id } : item,
              ),
            ),
        },
      ).then((created) => {
        if (created) {
          showToast('success', toasts.create || TOAST_MESSAGES.create);
        }
        return created;
      });
    },
    [runMutation, service, showToast, toasts.create],
  );

  /**
   * Updates an existing item, applying optimistic UI and a success toast.
   * @param {string} id - Item id.
   * @param {object} payload - Fields to update.
   * @returns {Promise<T|null>} The updated item or null on error.
   */
  const update = useCallback(
    (id, payload) => {
      const previousData = data;
      return runMutation(
        () => service.update(id, payload),
        {
          optimistic: () =>
            setData((prev) =>
              prev.map((item) =>
                item.id === id ? { ...item, ...payload } : item,
              ),
            ),
          rollback: () => setData(previousData),
          success: (updated) =>
            setData((prev) =>
              prev.map((item) => (item.id === id ? updated : item)),
            ),
        },
      ).then((updated) => {
        if (updated) {
          showToast('success', toasts.update || TOAST_MESSAGES.update);
        }
        return updated;
      });
    },
    [runMutation, service, data, showToast, toasts.update],
  );

  /**
   * Removes an item, applying optimistic UI and a success toast.
   * @param {string} id - Item id.
   * @returns {Promise<boolean>} True when deleted.
   */
  const remove = useCallback(
    (id) => {
      const previousData = data;
      return runMutation(
        () => service.remove(id),
        {
          optimistic: () =>
            setData((prev) => prev.filter((item) => item.id !== id)),
          rollback: () => setData(previousData),
          success: () => {},
        },
      ).then((updated) => {
        if (updated !== null) {
          showToast('success', toasts.remove || TOAST_MESSAGES.remove);
          return true;
        }
        return false;
      });
    },
    [runMutation, service, data, showToast, toasts.remove],
  );

  /**
   * Reorders items, applying optimistic UI and a success toast.
   * @param {Array<object>} items - Items with updated displayOrder.
   * @returns {Promise<boolean>} True when reordered.
   */
  const reorder = useCallback(
    (items) => {
      const previousData = data;
      return runMutation(
        () => service.reorder(items),
        {
          optimistic: () => setData(items),
          rollback: () => setData(previousData),
          success: () => {},
        },
      ).then((updated) => {
        if (updated !== null) {
          showToast('success', toasts.reorder || TOAST_MESSAGES.reorder);
          return true;
        }
        return false;
      });
    },
    [runMutation, service, data, showToast, toasts.reorder],
  );

  /**
   * Refreshes the collection in the background.
   * @returns {Promise<void>}
   */
  const refresh = useCallback(() => load(true), [load]);

  /**
   * Clears the current error state.
   */
  const clearError = useCallback(() => setError(null), []);

  return {
    data,
    loading,
    refreshing,
    error,
    create,
    update,
    remove,
    reorder,
    refresh,
    clearError,
  };
}

export { useResource };
export default useResource;
