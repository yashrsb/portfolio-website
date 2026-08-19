import { describe, it, expect } from 'vitest';
import { isBotUserAgent } from '../src/utils/botDetection.js';

describe('isBotUserAgent', () => {
  it('returns true for Googlebot', () => {
    expect(isBotUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe(true);
  });

  it('returns true for Bingbot', () => {
    expect(isBotUserAgent('Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)')).toBe(true);
  });

  it('returns true for Facebook crawler', () => {
    expect(
      isBotUserAgent('facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'),
    ).toBe(true);
  });

  it('returns true for Twitterbot', () => {
    expect(
      isBotUserAgent('Twitterbot/1.0'),
    ).toBe(true);
  });

  it('returns true for headless browser detection', () => {
    expect(isBotUserAgent('Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/91.0.4464.0'))
      .toBe(true);
  });

  it('returns true for curl', () => {
    expect(isBotUserAgent('curl/7.68.0')).toBe(true);
  });

  it('returns true for Python requests', () => {
    expect(isBotUserAgent('python-requests/2.25.1')).toBe(true);
  });

  it('returns false for a normal Chrome browser', () => {
    expect(
      isBotUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ),
    ).toBe(false);
  });

  it('returns false for a normal Firefox browser', () => {
    expect(
      isBotUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
      ),
    ).toBe(false);
  });

  it('returns false for an iPhone Safari UA', () => {
    expect(
      isBotUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      ),
    ).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isBotUserAgent('')).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(isBotUserAgent(null)).toBe(false);
    expect(isBotUserAgent(undefined)).toBe(false);
  });
});
