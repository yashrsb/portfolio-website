import { useState, useEffect } from 'react';

/**
 * usePrefersReducedMotion — detects if user prefers reduced motion.
 *
 * @returns {boolean} `true` if the user prefers reduced motion
 *
 * @example
 * const prefersReduced = usePrefersReducedMotion();
 * // Use to conditionally disable animations
 */
export function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (event) => {
      setPrefersReduced(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReduced;
}

