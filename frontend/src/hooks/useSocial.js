import { useState, useEffect } from 'react';
import { fetchSocial } from '../services/index.js';

/**
 * Hook to fetch social links from the API.
 * @returns {{ socialLinks: Array, loading: boolean, error: string|null }}
 */
export function useSocial() {
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchSocial()
      .then((data) => {
        if (!cancelled) {
          setSocialLinks(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load social links');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { socialLinks, loading, error };
}
