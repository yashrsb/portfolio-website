import { describe, it, expect } from 'vitest';
import {
  isRequired,
  isUrl,
  isEmail,
  isValidPercentage,
} from '../utils/validation';

describe('validation utilities', () => {
  describe('isRequired', () => {
    it('returns true for null', () => {
      expect(isRequired(null)).toBe(true);
    });

    it('returns true for undefined', () => {
      expect(isRequired(undefined)).toBe(true);
    });

    it('returns true for empty string', () => {
      expect(isRequired('')).toBe(true);
    });

    it('returns true for whitespace-only string', () => {
      expect(isRequired('   ')).toBe(true);
    });

    it('returns false for non-empty string', () => {
      expect(isRequired('hello')).toBe(false);
    });

    it('returns false for string with content surrounded by whitespace', () => {
      expect(isRequired('  hello  ')).toBe(false);
    });
  });

  describe('isUrl', () => {
    it('returns false for empty string', () => {
      expect(isUrl('')).toBe(false);
    });

    it('returns false for null', () => {
      expect(isUrl(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isUrl(undefined)).toBe(false);
    });

    it('returns true for valid http URL', () => {
      expect(isUrl('http://example.com')).toBe(true);
    });

    it('returns true for valid https URL', () => {
      expect(isUrl('https://example.com/path')).toBe(true);
    });

    it('returns false for ftp URL', () => {
      expect(isUrl('ftp://example.com')).toBe(false);
    });

    it('returns false for invalid URL', () => {
      expect(isUrl('not-a-url')).toBe(false);
    });

    it('returns false for URL without protocol', () => {
      expect(isUrl('example.com')).toBe(false);
    });
  });

  describe('isEmail', () => {
    it('returns true for valid email', () => {
      expect(isEmail('test@example.com')).toBe(true);
    });

    it('returns true for email with subdomain', () => {
      expect(isEmail('test@mail.example.com')).toBe(true);
    });

    it('returns true for email with plus alias', () => {
      expect(isEmail('test+tag@example.com')).toBe(true);
    });

    it('returns false for missing @', () => {
      expect(isEmail('testexample.com')).toBe(false);
    });

    it('returns false for missing domain', () => {
      expect(isEmail('test@')).toBe(false);
    });

    it('returns false for missing local part', () => {
      expect(isEmail('@example.com')).toBe(false);
    });

    it('returns false for spaces in email', () => {
      expect(isEmail('test @example.com')).toBe(false);
    });

    it('trims whitespace before validation', () => {
      expect(isEmail('  test@example.com  ')).toBe(true);
    });
  });

  describe('isValidPercentage', () => {
    it('returns true for 0', () => {
      expect(isValidPercentage(0)).toBe(true);
    });

    it('returns true for 100', () => {
      expect(isValidPercentage(100)).toBe(true);
    });

    it('returns true for value in range', () => {
      expect(isValidPercentage(50)).toBe(true);
    });

    it('returns true for string number', () => {
      expect(isValidPercentage('75')).toBe(true);
    });

    it('returns false for negative number', () => {
      expect(isValidPercentage(-1)).toBe(false);
    });

    it('returns false for number above 100', () => {
      expect(isValidPercentage(101)).toBe(false);
    });

    it('returns false for NaN', () => {
      expect(isValidPercentage(NaN)).toBe(false);
    });

    it('returns false for non-numeric string', () => {
      expect(isValidPercentage('abc')).toBe(false);
    });
  });
});
