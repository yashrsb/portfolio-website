import { useState, useEffect } from 'react';
import { fetchBlogCategories, fetchBlogTags } from '../services/index.js';

/**
 * Hook to fetch all blog categories.
 * @returns {{ categories: Array, loading: boolean, error: string|null }}
 */
export function useBlogCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    fetchBlogCategories(controller.signal)
      .then((data) => {
        if (!cancelled) {
          setCategories(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (err.name === 'AbortError' || err.name === 'CanceledError') {
            return;
          }
          setError(err.message || 'Failed to load categories');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return { categories, loading, error };
}

/**
 * Hook to fetch all blog tags.
 * @returns {{ tags: Array, loading: boolean, error: string|null }}
 */
export function useBlogTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    fetchBlogTags(controller.signal)
      .then((data) => {
        if (!cancelled) {
          setTags(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (err.name === 'AbortError' || err.name === 'CanceledError') {
            return;
          }
          setError(err.message || 'Failed to load tags');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return { tags, loading, error };
}
