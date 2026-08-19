import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../services/analyticsService';

/**
 * useAnalytics — automatic route-change tracking for the public frontend.
 *
 * Listens to React Router navigation and fires PAGE_VIEW events
 * for every route change (including initial load). Uses a ref to
 * prevent duplicate events on the same path + avoids tracking
 * during React development StrictMode double-invoke.
 *
 * Does NOT track:
 * - Admin pages (this hook is only used in the public app)
 * - Login or internal dashboard routes
 *
 * Analytics calls are fire-and-forget; failure never blocks navigation.
 */
export function useAnalytics() {
  const location = useLocation();
  const lastPathRef = useRef(null);

  useEffect(() => {
    const path = location.pathname + location.search;

    // Prevent duplicate page views for the same path+search combo
    if (lastPathRef.current === path) return;

    // Skip tracking on development StrictMode remount
    lastPathRef.current = path;

    trackPageView(path);
  }, [location]);
}

export default useAnalytics;
