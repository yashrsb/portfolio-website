/**
 * Bot detection utility.
 *
 * Checks the User-Agent string against a list of known crawler/bot
 * patterns. Returns true for any match so the caller can skip recording
 * analytics for that request.
 *
 * This is a heuristic, not a comprehensive detection system.
 */

const BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i, // Yahoo
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /applebot/i,
  /sogou/i,
  /exabot/i,
  /facebot/i,
  /facebookexternalhit/i,
  /ia_archiver/i,
  /ahrefsbot/i,
  /semrushbot/i,
  /mj12bot/i,
  /seznambot/i,
  /petalbot/i,
  /google-inspectiontool/i,
  /google-site-verification/i,
  /headlesschrome/i,
  /headless/i,
  /puppeteer/i,
  /selenium/i,
  /wget/i,
  /curl/i,
  /python-requests/i,
  /node-fetch/i,
  /java\/\d/i,
  /go-http-client/i,
  /libwww/i,
  /lwp-/i,
  /php/i,
  /zyborg/i,
  /nutch/i,
  /blex/i,
  /bytespider/i,
];

/**
 * Determines whether a User-Agent string looks like a bot/crawler.
 *
 * @param {string} userAgent - Raw User-Agent header value.
 * @returns {boolean} True if the UA is likely a bot.
 */
export function isBotUserAgent(userAgent) {
  if (!userAgent || typeof userAgent !== 'string') return false;
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

export default isBotUserAgent;
