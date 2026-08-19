import { describe, it, expect } from 'vitest';
import { parseUserAgent, parseDeviceType, parseBrowser, parseOs } from '../src/utils/userAgentParser.js';

describe('parseUserAgent', () => {
  describe('parseDeviceType', () => {
    it('classifies desktop Chrome correctly', () => {
      const ua =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      expect(parseDeviceType(ua)).toBe('DESKTOP');
    });

    it('classifies iPhone as mobile', () => {
      const ua =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
      expect(parseDeviceType(ua)).toBe('MOBILE');
    });

    it('classifies iPad as tablet', () => {
      const ua =
        'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
      expect(parseDeviceType(ua)).toBe('TABLET');
    });

    it('classifies Android tablet as tablet', () => {
      const ua =
        'Mozilla/5.0 (Linux; Android 13; SM-X906C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      expect(parseDeviceType(ua)).toBe('TABLET');
    });

    it('classifies Android phone as mobile', () => {
      const ua =
        'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
      expect(parseDeviceType(ua)).toBe('MOBILE');
    });

    it('returns UNKNOWN for empty/non-string UA', () => {
      expect(parseDeviceType('')).toBe('UNKNOWN');
      expect(parseDeviceType(null)).toBe('UNKNOWN');
      expect(parseDeviceType(undefined)).toBe('UNKNOWN');
    });
  });

  describe('parseBrowser', () => {
    it('classifies Chrome correctly', () => {
      const ua =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      expect(parseBrowser(ua)).toBe('CHROME');
    });

    it('classifies Firefox correctly', () => {
      const ua =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0';
      expect(parseBrowser(ua)).toBe('FIREFOX');
    });

    it('classifies Safari correctly', () => {
      const ua =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
      expect(parseBrowser(ua)).toBe('SAFARI');
    });

    it('classifies Edge correctly', () => {
      const ua =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
      expect(parseBrowser(ua)).toBe('EDGE');
    });

    it('classifies Opera correctly', () => {
      const ua =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0';
      expect(parseBrowser(ua)).toBe('OPERA');
    });

    it('returns UNKNOWN for empty/non-string UA', () => {
      expect(parseBrowser('')).toBe('UNKNOWN');
      expect(parseBrowser(null)).toBe('UNKNOWN');
    });
  });

  describe('parseOs', () => {
    it('classifies Windows correctly', () => {
      const ua =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      expect(parseOs(ua)).toBe('WINDOWS');
    });

    it('classifies macOS correctly', () => {
      const ua =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
      expect(parseOs(ua)).toBe('MACOS');
    });

    it('classifies iOS correctly', () => {
      const ua =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
      expect(parseOs(ua)).toBe('IOS');
    });

    it('classifies Android correctly', () => {
      const ua =
        'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
      expect(parseOs(ua)).toBe('ANDROID');
    });

    it('classifies Linux correctly', () => {
      const ua =
        'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0';
      expect(parseOs(ua)).toBe('LINUX');
    });

    it('returns UNKNOWN for empty/non-string UA', () => {
      expect(parseOs('')).toBe('UNKNOWN');
      expect(parseOs(null)).toBe('UNKNOWN');
    });
  });

  describe('parseUserAgent (combined)', () => {
    it('returns an object with deviceType, browser, and os', () => {
      const ua =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      const result = parseUserAgent(ua);
      expect(result).toHaveProperty('deviceType', 'DESKTOP');
      expect(result).toHaveProperty('browser', 'CHROME');
      expect(result).toHaveProperty('os', 'WINDOWS');
    });
  });
});
