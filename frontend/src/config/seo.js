/**
 * Centralized SEO configuration for the public frontend.
 * Values are sourced from Vite environment variables with safe
 * development fallbacks — never hardcode production URLs.
 */

const SITE_URL =
  import.meta.env.VITE_SITE_URL ||
  (typeof window !== 'undefined' && window.location.origin) ||
  'http://localhost:5173';

const cleanUrl = (url) => {
  try {
    const u = new URL(url, SITE_URL);
    return `${u.protocol}//${u.host}`;
  } catch {
    return SITE_URL.replace(/\/$/, '');
  }
};

export const SEO_CONFIG = {
  siteUrl: cleanUrl(SITE_URL),
  siteName: 'Portfolio',
  siteDescription:
    'Personal portfolio website showcasing experience, projects, skills, and technical blog.',
  siteType: 'website',
  authorName: 'Portfolio Author',
  authorUrl: cleanUrl(SITE_URL),
  twitterSite: '',
  defaultOgImage: '',
  titleSeparator: '—',
  titleTemplate: '%s — Portfolio',
  defaultRobots: 'index, follow',
};

export const buildUrl = (path) => {
  const base = SEO_CONFIG.siteUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

export const buildTitle = (title) => {
  if (!title) return SEO_CONFIG.siteName;
  if (title === SEO_CONFIG.siteName) return SEO_CONFIG.siteName;
  return SEO_CONFIG.titleTemplate.replace('%s', title);
};
