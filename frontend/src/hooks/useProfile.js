import { useState, useEffect } from 'react';
import { fetchProfile } from '../services/index.js';

/**
 * Hook to fetch the portfolio profile.
 * @returns {{ profile: object|null, loading: boolean, error: string|null }}
 */
export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchProfile()
      .then((data) => {
        if (!cancelled) {
          setProfile(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load profile');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { profile, loading, error };
}
