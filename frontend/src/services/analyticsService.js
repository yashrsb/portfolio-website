import { isAnalyticsOptedOut } from '../utils/analyticsOptOut';

/**
 * Analytics service for the public-facing frontend.
 *
 * Sends non-blocking, fire-and-forget analytics events to the backend.
 * Never throws — if tracking fails, the visitor's experience is unaffected.
 *
 * Events are only sent when:
 * - The visitor has not opted out.
 * - The event type is valid.
 *
 * The visitor hash is generated server-side from the IP + User-Agent,
 * so the frontend does not handle any PII.
 */

const VALID_EVENT_TYPES = [
  'PAGE_VIEW',
  'PROJECT_VIEW',
  'PROJECT_CLICK',
  'BLOG_POST_VIEW',
];

/**
 * Sends an analytics event to the backend.
 *
 * Uses `navigator.sendBeacon` when available for reliable delivery on
 * page-unload. Falls back to fetch for in-page interactions.
 *
 * @param {string} eventType - One of PAGE_VIEW, PROJECT_VIEW, PROJECT_CLICK, BLOG_POST_VIEW.
 * @param {string} path - The URL path (e.g., "/projects/notifyhub").
 * @param {object} [metadata] - Optional metadata (e.g., { projectSlug, destination }).
 */
export function trackEvent(eventType, path, metadata = {}) {
  if (isAnalyticsOptedOut()) return;
  if (!VALID_EVENT_TYPES.includes(eventType)) return;
  if (!path || typeof path !== 'string') return;

  const payload = {
    eventType,
    path,
    ...(Object.keys(metadata).length > 0 ? { metadata } : {}),
  };

  try {
    const body = JSON.stringify(payload);

    // sendBeacon is ideal for page-unload scenarios: it fires even after
    // the page is closing, and returns false if the browser can't queue it.
    if (navigator?.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      const sent = navigator.sendBeacon(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1'}/analytics/events`,
        blob,
      );
      if (sent) return;
    }

    // Fallback: non-blocking fetch (no await — fire and forget)
    fetch(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1'}/analytics/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true, // allows delivery during page unload
      },
    ).catch(() => {});
  } catch {
    // Silently ignore — analytics must never break the page.
  }
}

/**
 * Tracks a page view for the given path.
 *
 * @param {string} path - The current URL path.
 */
export function trackPageView(path) {
  trackEvent('PAGE_VIEW', path);
}

/**
 * Tracks a project view (visiting a project detail page).
 *
 * @param {string} slug - The project slug.
 * @param {string} path - The full URL path.
 */
export function trackProjectView(slug, path) {
  trackEvent('PROJECT_VIEW', path, { projectSlug: slug });
}

/**
 * Tracks a project click (GitHub or Demo link click).
 *
 * @param {string} slug - The project slug.
 * @param {string} destination - "github" or "demo".
 * @param {string} path - The current URL path.
 */
export function trackProjectClick(slug, destination, path) {
  trackEvent('PROJECT_CLICK', path, { projectSlug: slug, destination });
}

/**
 * Tracks a blog post view.
 *
 * @param {string} slug - The blog post slug.
 * @param {string} path - The full URL path.
 */
export function trackBlogPostView(slug, path) {
  trackEvent('BLOG_POST_VIEW', path, { blogPostSlug: slug });
}

export default {
  trackEvent,
  trackPageView,
  trackProjectView,
  trackProjectClick,
  trackBlogPostView,
};
