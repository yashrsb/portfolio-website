import { useState, useEffect } from 'react';
import { fetchSkills } from '../services/index.js';

/**
 * Hook to fetch skills grouped by category from the API.
 * @returns {{ skills: object, loading: boolean, error: string|null }}
 */
export function useSkills() {
  const [skills, setSkills] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchSkills()
      .then((data) => {
        if (!cancelled) {
          setSkills(data || {});
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load skills');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { skills, loading, error };
}
