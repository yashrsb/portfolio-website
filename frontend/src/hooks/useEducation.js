import { useState, useEffect } from 'react';
import { fetchEducation } from '../services/index.js';

/**
 * Hook to fetch education, certificates, and achievements from the API.
 * @returns {{ education: Array, certificates: Array, achievements: Array, loading: boolean, error: string|null }}
 */
export function useEducation() {
  const [education, setEducation] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchEducation()
      .then((data) => {
        if (!cancelled) {
          setEducation(data?.education || []);
          setCertificates(data?.certificates || []);
          setAchievements(data?.achievements || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load education data');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { education, certificates, achievements, loading, error };
}
