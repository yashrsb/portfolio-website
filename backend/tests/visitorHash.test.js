import { describe, it, expect } from 'vitest';
import generateVisitorHash from '../src/utils/visitorHash.js';

describe('generateVisitorHash', () => {
  it('produces a deterministic hash for the same IP + UA within a day', () => {
    const ip = '192.168.1.1';
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0';

    const hash1 = generateVisitorHash(ip, ua);
    const hash2 = generateVisitorHash(ip, ua);

    expect(hash1).toBe(hash2);
  });

  it('produces a different hash for different IPs', () => {
    const hash1 = generateVisitorHash('192.168.1.1', 'Chrome/120');
    const hash2 = generateVisitorHash('192.168.1.2', 'Chrome/120');

    expect(hash1).not.toBe(hash2);
  });

  it('produces a different hash for different user agents', () => {
    const hash1 = generateVisitorHash('192.168.1.1', 'Chrome/120');
    const hash2 = generateVisitorHash('192.168.1.1', 'Firefox/121');

    expect(hash1).not.toBe(hash2);
  });

  it('handles null/undefined inputs without throwing', () => {
    expect(() => generateVisitorHash(null, null)).not.toThrow();
    expect(() => generateVisitorHash(undefined, undefined)).not.toThrow();
    expect(() => generateVisitorHash(null, 'Chrome')).not.toThrow();
    expect(() => generateVisitorHash('1.2.3.4', null)).not.toThrow();
  });

  it('returns a string containing a date prefix', () => {
    const hash = generateVisitorHash('10.0.0.1', 'TestAgent');
    // Format: YYYY-MM-DD:hexhash
    expect(hash).toMatch(/^\d{4}-\d{2}-\d{2}:[a-f0-9]{64}$/);
  });

  it('does not contain raw IP address', () => {
    const ip = '192.168.1.1';
    const hash = generateVisitorHash(ip, 'TestAgent');

    expect(hash).not.toContain(ip);
  });

  it('does not contain raw user agent', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120';
    const hash = generateVisitorHash('1.2.3.4', ua);

    expect(hash).not.toContain(ua);
    expect(hash).not.toContain('Mozilla');
  });
});
