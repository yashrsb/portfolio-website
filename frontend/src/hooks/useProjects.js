import { useState, useEffect } from 'react';
import { fetchProjects } from '../services/index.js';

/**
 * Hook to fetch projects from the API.
 * @returns {{ projects: Array, loading: boolean, error: string|null }}
 */
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchProjects()
      .then((data) => {
        if (!cancelled) {
          setProjects(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load projects');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { projects, loading, error };
}
