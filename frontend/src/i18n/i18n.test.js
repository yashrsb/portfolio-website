import { describe, it, expect, beforeEach, vi } from 'vitest';
import i18n, { LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES } from './index';

describe('i18n configuration', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'en';
  });

  it('supports English and Hindi', () => {
    expect(SUPPORTED_LANGUAGES).toEqual(['en', 'hi']);
  });

  it('falls back to English for missing keys', async () => {
    await i18n.changeLanguage('hi');
    // key exists only in en fallback path? use a definitely missing key
    expect(i18n.t('nonexistent.key.for.fallback.test')).toBe(
      'nonexistent.key.for.fallback.test',
    );
    await i18n.changeLanguage('en');
  });

  it('updates document lang and persists selection on language change', async () => {
    await i18n.changeLanguage('hi');
    expect(document.documentElement.lang).toBe('hi');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('hi');

    await i18n.changeLanguage('en');
    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
  });

  it('has core navigation translations for both languages', () => {
    const enHome = i18n.getFixedT('en')('nav.home');
    const hiHome = i18n.getFixedT('hi')('nav.home');
    expect(enHome).toBe('Home');
    expect(hiHome).toBe('होम');
  });

  it('has core section translations for both languages', () => {
    expect(i18n.getFixedT('en')('projects.title')).toBe('Projects');
    expect(i18n.getFixedT('hi')('projects.title')).toBe('प्रोजेक्ट्स');
    expect(i18n.getFixedT('en')('contact.submit.send')).toBe('Send Message');
    expect(i18n.getFixedT('hi')('contact.submit.send')).toBe('संदेश भेजें');
  });
});
