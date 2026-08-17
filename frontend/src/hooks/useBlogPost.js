import { useState, useEffect } from 'react';
import { fetchBlogPost } from '../services/index.js';

/**
 * Hook to fetch a single blog post by slug.
 * State machine: idle → loading → success | notFound | error
 *
 * @param {string} slug - Post slug.
 * @returns {{ post: object|null, loading: boolean, error: string|null, notFound: boolean }}
 */
export function useBlogPost(slug) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    setLoading(true);
    setError(null);
    setNotFound(false);

    fetchBlogPost(slug, controller.signal)
      .then((data) => {
        if (!cancelled) {
          setPost(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (err.name === 'AbortError' || err.name === 'CanceledError') {
            return;
          }
          if (err.status === 404) {
            setNotFound(true);
          } else {
            setError(err.message || 'Failed to load blog post');
          }
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [slug]);

  return { post, loading, error, notFound };
}
