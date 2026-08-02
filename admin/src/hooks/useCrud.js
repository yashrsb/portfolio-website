import { useState, useCallback } from 'react';

/**
 * useCrud — in-memory CRUD state management for Phase 7.
 *
 * NOTE: Data is not persisted and no backend calls are made.
 * This hook mirrors the API contract that Phase 8 will use.
 *
 * @template T
 * @param {T[]} initialData - Initial mock data
 * @returns {{
 *   items: T[],
 *   createItem: (item: Omit<T, 'id'>) => void,
 *   updateItem: (id: string, patch: Partial<T>) => void,
 *   deleteItem: (id: string) => void,
 *   getItem: (id: string) => T | undefined,
 * }}
 */
function useCrud(initialData) {
  const [items, setItems] = useState(initialData);

  const createItem = useCallback((item) => {
    const newItem = { ...item, id: `${Date.now()}` };
    setItems((prev) => [...prev, newItem]);
  }, []);

  const updateItem = useCallback((id, patch) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }, []);

  const deleteItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const getItem = useCallback(
    (id) => items.find((item) => item.id === id),
    [items],
  );

  return { items, createItem, updateItem, deleteItem, getItem };
}

export { useCrud };
export default useCrud;
