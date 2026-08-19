import { useState, useEffect, useMemo } from 'react';
import { fetchBlogPosts } from '../services/index.js';

/**
 * Hook to fetch paginated, filtered, searchable blog posts.
 * State machine: idle → loading → success | error
 *
 * @param {object} [query] - Query parameters (page, limit, search, category, tag, featured).
 * @param {string} [query.search]
 * @param {string} [query.category]
 * @param {string} [query.tag]
 * @param {boolean} [query.featured]
 * @param {number} [query.page]
 * @param {number} [query.limit]
 * @returns {{ posts: Array, pagination: object, loading: boolean, error: string|null }}
 */
export function useBlogPosts(query = {}) {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const queryKey = useMemo(() => JSON.stringify(query), [query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const signal = controller.signal;

    fetchBlogPosts(query, signal)
      .then((result) => {
        if (!cancelled) {
          setPosts(result.posts || []);
          setPagination(result.pagination || {});
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (err.name === 'CanceledError' || err.name === 'AbortError') {
            return;
          }
          setError(err.message || 'Failed to load blog posts');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [queryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return { posts, pagination, loading, error };
}
