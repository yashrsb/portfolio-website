import { useState, useEffect } from 'react';
import { fetchExperience } from '../services/index.js';

/**
 * Hook to fetch work experience from the API.
 * @returns {{ experience: Array, loading: boolean, error: string|null }}
 */
export function useExperience() {
  const [experience, setExperience] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchExperience()
      .then((data) => {
        if (!cancelled) {
          setExperience(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load experience');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { experience, loading, error };
}
