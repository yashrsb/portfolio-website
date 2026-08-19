/**
 * Analytics opt-out utility.
 *
 * Respects a localStorage flag `analytics_opt_out`. When set to "true",
 * the frontend will not send any analytics events.
 *
 * This is a technical mechanism, not legal advice. In jurisdictions that
 * require explicit consent, an opt-in approach should be used instead.
 */

const OPT_OUT_KEY = 'analytics_opt_out';

/**
 * Checks whether the visitor has opted out of analytics.
 *
 * @returns {boolean} True if analytics is opted out.
 */
export function isAnalyticsOptedOut() {
  try {
    return localStorage.getItem(OPT_OUT_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Sets the analytics opt-out preference.
 *
 * @param {boolean} optedOut - Whether to opt out.
 */
export function setAnalyticsOptOut(optedOut) {
  try {
    localStorage.setItem(OPT_OUT_KEY, optedOut ? 'true' : 'false');
  } catch {
    // localStorage may be unavailable in private mode / SSR
  }
}

export default { isAnalyticsOptedOut, setAnalyticsOptOut };
