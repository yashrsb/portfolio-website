import { useState, useEffect } from 'react';
import { fetchProjectBySlug } from '../services/index.js';

/**
 * Hook to fetch a single project by slug from the API.
 *
 * State machine:
 *   idle → loading → success
 *   idle → loading → notFound
 *   idle → loading → error
 *
 * @param {string} slug - Project slug.
 * @returns {{ project: object|null, loading: boolean, error: string|null, notFound: boolean }}
 */
export function useProject(slug) {
  const [project, setProject] = useState(null);
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
    setLoading(true);
    setError(null);
    setNotFound(false);

    fetchProjectBySlug(slug)
      .then((data) => {
        if (!cancelled) {
          setProject(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (err.status === 404) {
            setNotFound(true);
          } else {
            setError(err.message || 'Failed to load project');
          }
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { project, loading, error, notFound };
}
