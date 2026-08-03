import { useState, useEffect, useCallback } from 'react';

/**
 * @typedef {Object} IntersectionObserverOptions
 * @property {number} [threshold=0.1] - Visibility threshold (0–1)
 * @property {string} [rootMargin='0px'] - Margin around the root
 * @property {boolean} [triggerOnce=true] - Whether to stop observing after first intersection
 */

/**
 * useIntersectionObserver — observes when an element enters the viewport.
 *
 * Uses a callback ref that stores the DOM node in state so the observer is
 * (re)attached whenever the element becomes available — including after the
 * component mounts while children are conditionally rendered behind an async
 * loading state.
 *
 * @param {IntersectionObserverOptions} [options]
 * @returns {{ ref: React.RefObject<null>, isVisible: boolean }}
 *
 * @example
 * const { ref, isVisible } = useIntersectionObserver({ threshold: 0.2 });
 * return <div ref={ref} className={isVisible ? 'visible' : 'hidden'} />;
 */
export function useIntersectionObserver(options = {}) {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;

  const [element, setElement] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!element) return;

    // If reduced motion is preferred, immediately show
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(entry.target);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element, threshold, rootMargin, triggerOnce]);

  const ref = useCallback((node) => {
    setElement(node);
  }, []);

  return { ref, isVisible };
}
