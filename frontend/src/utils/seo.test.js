import { describe, it, expect, beforeEach } from 'vitest';
import { setSEOMeta, setJsonLd, removeJsonLd, setPageSEO } from '../utils/seo';
import { SEO_CONFIG, buildUrl, buildTitle } from '../config/seo';

describe('SEO utility', () => {
  beforeEach(() => {
    // Reset head between tests
    document.head.innerHTML = '';
  });

  describe('setSEOMeta', () => {
    it('sets document.title with separator', () => {
      setSEOMeta({ title: 'My Page' });
      expect(document.title).toBe('My Page — Portfolio');
    });

    it('uses site name as fallback title', () => {
      setSEOMeta({});
      expect(document.title).toBe('Portfolio');
    });

    it('sets meta description', () => {
      setSEOMeta({ description: 'Custom description' });
      const tag = document.querySelector('meta[name="description"]');
      expect(tag).toBeTruthy();
      expect(tag.content).toBe('Custom description');
    });

    it('creates canonical link', () => {
      setSEOMeta({ canonicalUrl: '/about' });
      const link = document.querySelector('link[rel="canonical"]');
      expect(link).toBeTruthy();
    });

    it('sets og:title', () => {
      setSEOMeta({ ogTitle: 'OG Title' });
      const tag = document.querySelector('meta[property="og:title"]');
      expect(tag).toBeTruthy();
      expect(tag.content).toBe('OG Title');
    });

    it('sets og:site_name to site name', () => {
      setSEOMeta({ title: 'Test' });
      const tag = document.querySelector('meta[property="og:site_name"]');
      expect(tag).toBeTruthy();
      expect(tag.content).toBe(SEO_CONFIG.siteName);
    });

    it('removes og:image when no image provided', () => {
      // First set an image
      setSEOMeta({ title: 'Test', ogImage: 'https://example.com/img.png' });
      expect(document.querySelector('meta[property="og:image"]')).toBeTruthy();

      // Then remove it by setting without image
      setSEOMeta({ title: 'Test', ogImage: '' });
      expect(document.querySelector('meta[property="og:image"]')).toBeFalsy();
    });

    it('sets twitter:card to summary when no image', () => {
      setSEOMeta({ title: 'Test' });
      const tag = document.querySelector('meta[name="twitter:card"]');
      expect(tag).toBeTruthy();
      expect(tag.content).toBe('summary');
    });

    it('sets twitter:card to summary_large_image when image provided', () => {
      setSEOMeta({ title: 'Test', ogImage: 'https://example.com/img.png' });
      const tag = document.querySelector('meta[name="twitter:card"]');
      expect(tag).toBeTruthy();
      expect(tag.content).toBe('summary_large_image');
    });

    it('sets robots meta to noindex when requested', () => {
      setSEOMeta({ title: 'Test', robots: 'noindex, nofollow' });
      const tag = document.querySelector('meta[name="robots"]');
      expect(tag).toBeTruthy();
      expect(tag.content).toBe('noindex, nofollow');
    });

    it('does not create stale twitter:image when no image on second call', () => {
      setSEOMeta({ title: 'Test', ogImage: 'https://example.com/img.png' });
      expect(document.querySelector('meta[name="twitter:image"]')).toBeTruthy();

      setSEOMeta({ title: 'Test', ogImage: '' });
      expect(document.querySelector('meta[name="twitter:image"]')).toBeFalsy();
    });
  });

  describe('setJsonLd', () => {
    it('creates a JSON-LD script tag with correct type', () => {
      setJsonLd('test-ld', { name: 'Test' });
      const script = document.getElementById('test-ld');
      expect(script).toBeTruthy();
      expect(script.type).toBe('application/ld+json');
      expect(JSON.parse(script.textContent)).toEqual({ name: 'Test' });
    });

    it('replaces existing JSON-LD with same id', () => {
      setJsonLd('test-ld', { name: 'First' });
      setJsonLd('test-ld', { name: 'Second' });
      const scripts = document.querySelectorAll('#test-ld');
      expect(scripts.length).toBe(1);
      expect(JSON.parse(scripts[0].textContent)).toEqual({ name: 'Second' });
    });

    it('safely serializes data with special characters', () => {
      const malicious = '<script>alert("xss")</script>';
      setJsonLd('safe-ld', { name: malicious });
      const script = document.getElementById('safe-ld');
      // JSON-LD must escape < and > to prevent script injection
      expect(script.textContent).not.toContain('<script>');
      expect(script.textContent).toContain('\\u003cscript\\u003e');
    });
  });

  describe('removeJsonLd', () => {
    it('removes a JSON-LD script by id', () => {
      setJsonLd('remove-me', { name: 'Test' });
      expect(document.getElementById('remove-me')).toBeTruthy();
      removeJsonLd('remove-me');
      expect(document.getElementById('remove-me')).toBeFalsy();
    });

    it('does not throw when id does not exist', () => {
      expect(() => removeJsonLd('nonexistent')).not.toThrow();
    });
  });

  describe('setPageSEO', () => {
    it('sets title, description, canonical, and OG tags', () => {
      setPageSEO({
        title: 'About',
        description: 'About me',
        path: '/about',
      });
      expect(document.title).toBe('About — Portfolio');
      const desc = document.querySelector('meta[name="description"]');
      expect(desc.content).toBe('About me');
      const canonical = document.querySelector('link[rel="canonical"]');
      expect(canonical.href).toContain('/about');
      const ogTitle = document.querySelector('meta[property="og:title"]');
      expect(ogTitle.content).toBe('About');
    });

    it('defaults to noindex when noindex is true', () => {
      setPageSEO({
        title: '404',
        path: '/nonexistent',
        noindex: true,
      });
      const robots = document.querySelector('meta[name="robots"]');
      expect(robots.content).toBe('noindex, nofollow');
    });

    it('defaults to index, follow when noindex is false', () => {
      setPageSEO({
        title: 'Home',
        path: '/',
      });
      const robots = document.querySelector('meta[name="robots"]');
      expect(robots.content).toBe('index, follow');
    });
  });

  describe('SEO_CONFIG', () => {
    it('provides sensible defaults', () => {
      expect(SEO_CONFIG.siteName).toBe('Portfolio');
      expect(SEO_CONFIG.defaultRobots).toBe('index, follow');
      expect(SEO_CONFIG.titleSeparator).toBe('—');
    });
  });

  describe('buildUrl', () => {
    it('builds absolute URL from site URL + path', () => {
      const url = buildUrl('/about');
      expect(url).toMatch(/^https?:\/\/.+\/about$/);
    });

    it('handles root path', () => {
      const url = buildUrl('/');
      expect(url).toMatch(/^https?:\/\/.+$/);
    });
  });

  describe('buildTitle', () => {
    it('formats title with separator', () => {
      expect(buildTitle('Projects')).toBe('Projects — Portfolio');
    });

    it('returns site name for undefined title', () => {
      expect(buildTitle()).toBe('Portfolio');
    });
  });
});
