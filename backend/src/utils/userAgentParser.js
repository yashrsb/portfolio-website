/**
 * Lightweight User-Agent parsing utility.
 *
 * Extracts browser, operating system, and device type from a User-Agent
 * string without storing the raw UA. Only the parsed classifications are
 * persisted.
 */

/**
 * Classifies the device type from a User-Agent string.
 *
 * @param {string} userAgent - Raw User-Agent header value.
 * @returns {'DESKTOP'|'MOBILE'|'TABLET'|'UNKNOWN'}
 */
export function parseDeviceType(userAgent) {
  if (!userAgent || typeof userAgent !== 'string') return 'UNKNOWN';

  const ua = userAgent.toLowerCase();

  // iPad detection — iPad UAs do not contain "mobile" but are tablets.
  if (ua.includes('ipad')) {
    return 'TABLET';
  }

  // Android tablet: contains "android" without "mobile"
  if (ua.includes('android') && !ua.includes('mobi') && !ua.includes('mobile')) {
    return 'TABLET';
  }

  // Android tablet with "tablet" keyword
  if (ua.includes('tablet')) {
    return 'TABLET';
  }

  if (ua.includes('mobi') || ua.includes('mobile')) {
    return 'MOBILE';
  }

  // Desktop indicators (covers most desktop UAs)
  if (
    ua.includes('windows') ||
    ua.includes('macintosh') ||
    ua.includes('linux') ||
    ua.includes('x11')
  ) {
    return 'DESKTOP';
  }

  return 'UNKNOWN';
}

/**
 * Classifies the browser from a User-Agent string.
 *
 * @param {string} userAgent - Raw User-Agent header value.
 * @returns {'CHROME'|'FIREFOX'|'SAFARI'|'EDGE'|'OPERA'|'OTHER'|'UNKNOWN'}
 */
export function parseBrowser(userAgent) {
  if (!userAgent || typeof userAgent !== 'string') return 'UNKNOWN';

  const ua = userAgent.toLowerCase();

  // Order matters: check Edge/Opera first (they include "Chrome" in UA)
  if (ua.includes('edg/')) {
    return 'EDGE';
  }

  if (ua.includes('opr/') || ua.includes('opera')) {
    return 'OPERA';
  }

  if (ua.includes('firefox/')) {
    return 'FIREFOX';
  }

  if (ua.includes('chrome/') || ua.includes('chromium/')) {
    return 'CHROME';
  }

  // Safari without Chrome (check after Chrome/Firefox since Safari UA also
  // appears in Chrome on some platforms)
  if (ua.includes('safari/') && !ua.includes('chrome/')) {
    return 'SAFARI';
  }

  return 'UNKNOWN';
}

/**
 * Classifies the operating system from a User-Agent string.
 *
 * @param {string} userAgent - Raw User-Agent header value.
 * @returns {'WINDOWS'|'MACOS'|'LINUX'|'ANDROID'|'IOS'|'OTHER'|'UNKNOWN'}
 */
export function parseOs(userAgent) {
  if (!userAgent || typeof userAgent !== 'string') return 'UNKNOWN';

  const ua = userAgent.toLowerCase();

  if (ua.includes('windows')) {
    return 'WINDOWS';
  }

  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    return 'IOS';
  }

  if (ua.includes('android')) {
    return 'ANDROID';
  }

  if (ua.includes('macintosh') || ua.includes('mac os')) {
    return 'MACOS';
  }

  if (ua.includes('linux') || ua.includes('x11')) {
    return 'LINUX';
  }

  return 'OTHER';
}

/**
 * Parses a User-Agent string into structured fields suitable for storage.
 * Returns only the classified fields, never the raw User-Agent.
 *
 * @param {string} userAgent - Raw User-Agent header value.
 * @returns {{deviceType: string, browser: string, os: string}}
 */
export function parseUserAgent(userAgent) {
  return {
    deviceType: parseDeviceType(userAgent),
    browser: parseBrowser(userAgent),
    os: parseOs(userAgent),
  };
}

export default parseUserAgent;
