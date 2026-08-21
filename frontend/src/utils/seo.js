/**
 * Centralized SEO utility for managing document <head>.
 *
 * This replaces scattered document.title / meta tag manipulation across
 * page components. It handles creation, update, AND removal of tags so
 * that stale values never leak between page transitions.
 *
 * Design decisions:
 * - No external SEO framework (react-helmet, etc.) — the app uses
 *   manual DOM manipulation; we stay consistent but centralize it.
 * - All tag values are treated as untrusted content and serialized
 *   safely into JSON-LD script tags.
 * - Empty/falsy values REMOVE the corresponding tag rather than leaving
 *   stale data from a previous page.
 */

import { SEO_CONFIG, buildUrl, buildTitle } from '../config/seo';

const head = () => (typeof document !== 'undefined' ? document.head : null);

const getOrCreateMetaByName = (name) => {
  const h = head();
  if (!h) return null;
  let tag = h.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    h.appendChild(tag);
  }
  return tag;
};

/**
 * Create or get an OG meta tag by property.
 */
const getOrCreateMetaByProperty = (property) => {
  const h = head();
  if (!h) return null;
  let tag = h.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    h.appendChild(tag);
  }
  return tag;
};

/**
 * Create or get a link[rel] tag.
 */
const getOrCreateLink = (rel) => {
  const h = head();
  if (!h) return null;
  let tag = h.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    h.appendChild(tag);
  }
  return tag;
};

/**
 * Remove a meta tag from head.
 */
const removeMeta = (selector) => {
  if (typeof document === 'undefined') return;
  const tag = document.head.querySelector(selector);
  if (tag) tag.remove();
};

/**
 * Remove a JSON-LD script by id.
 */
export const removeJsonLd = (id) => {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById(id);
  if (existing) existing.remove();
};

/**
 * Inject or update a JSON-LD structured data script tag.
 * Safely serializes data to prevent XSS — user content is never
 * injected as raw HTML.
 *
 * @param {string} id - Unique identifier for the script tag
 * @param {object} data - The structured data object
 */
export const setJsonLd = (id, data) => {
  if (typeof document === 'undefined') return;

  removeJsonLd(id);

  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  // Use JSON.stringify then escape < > to prevent script injection
  script.textContent = JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e');
  document.head.appendChild(script);
};

/**
 * Core SEO tag setter. Creates, updates, or removes meta/link tags
 * based on the provided values. Empty/falsy values REMOVE the tag
 * to prevent stale data leaking between pages.
 *
 * @param {object} params
 * @param {string} [params.title] - Page title (without site name suffix)
 * @param {string} [params.description] - Meta description
 * @param {string} [params.canonicalUrl] - Full canonical URL (absolute or path)
 * @param {string} [params.ogTitle]
 * @param {string} [params.ogDescription]
 * @param {string} [params.ogType] - 'website' | 'article' | etc.
 * @param {string} [params.ogImage] - Absolute URL or empty to remove
 * @param {string} [params.ogImageAlt]
 * @param {object} [params.articleMeta] - { publishedTime, modifiedTime, author, section, tags }
 * @param {string} [params.twitterCard] - 'summary' | 'summary_large_image'
 * @param {string} [params.twitterTitle]
 * @param {string} [params.twitterDescription]
 * @param {string} [params.twitterImage]
 * @param {string} [params.robots] - 'index, follow' | 'noindex, nofollow'
 * @param {string} [params.author] - author meta name
 * @param {string} [params.titleTemplate] - Override default title template
 */
export const setSEOMeta = ({
  title,
  description,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogType = 'website',
  ogImage,
  ogImageAlt,
  articleMeta,
  twitterCard,
  twitterTitle,
  twitterDescription,
  twitterImage,
  robots,
  author,
  titleTemplate,
}) => {
  if (typeof document === 'undefined') return;

  // --- Title ---
  if (title) {
    if (titleTemplate) {
      document.title = titleTemplate.replace('%s', title);
    } else {
      document.title = buildTitle(title);
    }
  } else {
    document.title = SEO_CONFIG.siteName;
  }

  // --- Description ---
  const descTag = getOrCreateMetaByName('description');
  if (descTag) {
    if (description) {
      descTag.content = description;
    } else {
      descTag.content = SEO_CONFIG.siteDescription;
    }
  }

  // --- Canonical ---
  const canonical = getOrCreateLink('canonical');
  if (canonical) {
    if (canonicalUrl) {
      canonical.href = canonicalUrl.startsWith('http')
        ? canonicalUrl
        : buildUrl(canonicalUrl);
    } else {
      canonical.href = SEO_CONFIG.siteUrl;
    }
  }

  // --- Open Graph ---
  const ogTags = {
    'og:title': ogTitle || title,
    'og:description': ogDescription || description,
    'og:type': ogType || 'website',
    'og:url': canonicalUrl
      ? canonicalUrl.startsWith('http')
        ? canonicalUrl
        : buildUrl(canonicalUrl)
      : window.location.href.split('?')[0],
    'og:site_name': SEO_CONFIG.siteName,
  };

  Object.entries(ogTags).forEach(([property, value]) => {
    if (value) {
      const tag = getOrCreateMetaByProperty(property);
      if (tag) tag.content = value;
    } else {
      // Remove stale OG tags that don't apply to this page
      removeMeta(`meta[property="${property}"]`);
    }
  });

  // Open Graph image — create or remove
  if (ogImage) {
    const imgTag = getOrCreateMetaByProperty('og:image');
    if (imgTag) imgTag.content = ogImage;

    const widthTag = getOrCreateMetaByProperty('og:image:width');
    if (widthTag) widthTag.content = '1200';

    const heightTag = getOrCreateMetaByProperty('og:image:height');
    if (heightTag) heightTag.content = '630';

    if (ogImageAlt) {
      const altTag = getOrCreateMetaByProperty('og:image:alt');
      if (altTag) altTag.content = ogImageAlt;
    } else {
      removeMeta('meta[property="og:image:alt"]');
    }
  } else {
    // No image for this page — remove any stale OG image tags
    removeMeta('meta[property="og:image"]');
    removeMeta('meta[property="og:image:width"]');
    removeMeta('meta[property="og:image:height"]');
    removeMeta('meta[property="og:image:alt"]');
  }

  // Article metadata (only for 'article' type)
  if (ogType === 'article' && articleMeta) {
    const {
      publishedTime,
      modifiedTime,
      author: artAuthor,
      section,
      tags,
    } = articleMeta;

    if (publishedTime) {
      const tag = getOrCreateMetaByProperty('article:published_time');
      if (tag) tag.content = new Date(publishedTime).toISOString();
    } else {
      removeMeta('meta[property="article:published_time"]');
    }

    if (modifiedTime) {
      const tag = getOrCreateMetaByProperty('article:modified_time');
      if (tag) tag.content = new Date(modifiedTime).toISOString();
    } else {
      removeMeta('meta[property="article:modified_time"]');
    }

    if (artAuthor) {
      const tag = getOrCreateMetaByProperty('article:author');
      if (tag) tag.content = artAuthor;
    } else {
      removeMeta('meta[property="article:author"]');
    }

    if (section) {
      const tag = getOrCreateMetaByProperty('article:section');
      if (tag) tag.content = section;
    } else {
      removeMeta('meta[property="article:section"]');
    }

    if (tags && tags.length > 0) {
      tags.forEach((t, i) => {
        if (i < 10) {
          const tag = getOrCreateMetaByProperty(`article:tag:${i + 1}`);
          if (tag) tag.content = t;
        }
      });
    } else {
      for (let i = 0; i < 10; i++) {
        removeMeta(`meta[property="article:tag:${i + 1}"]`);
      }
    }
  }

  // --- Twitter / X Cards ---
  const twitterSettings = {
    'twitter:card':
      twitterCard || (ogImage ? 'summary_large_image' : 'summary'),
    'twitter:title': twitterTitle || ogTitle || title,
    'twitter:description': twitterDescription || description,
  };

  Object.entries(twitterSettings).forEach(([name, value]) => {
    if (value) {
      const tag = getOrCreateMetaByName(name);
      if (tag) tag.content = value;
    } else {
      removeMeta(`meta[name="${name}"]`);
    }
  });

  if (twitterImage) {
    const tag = getOrCreateMetaByName('twitter:image');
    if (tag) tag.content = twitterImage;
  } else if (ogImage) {
    const tag = getOrCreateMetaByName('twitter:image');
    if (tag) tag.content = ogImage;
  } else {
    removeMeta('meta[name="twitter:image"]');
  }

  if (SEO_CONFIG.twitterSite) {
    const tag = getOrCreateMetaByName('twitter:site');
    if (tag) tag.content = SEO_CONFIG.twitterSite;
  } else {
    removeMeta('meta[name="twitter:site"]');
  }

  // --- Robots ---
  if (robots) {
    const robotsTag = getOrCreateMetaByName('robots');
    if (robotsTag) robotsTag.content = robots;
  }

  // --- Author ---
  if (author) {
    const authorTag = getOrCreateMetaByName('author');
    if (authorTag) authorTag.content = author;
  }
};

/**
 * Convenience: set SEO for a standard page with sensible defaults.
 * @param {object} params - Same as setSEOMeta but with fewer options.
 */
export const setPageSEO = ({
  title,
  description,
  path,
  image,
  imageAlt,
  type = 'website',
  noindex = false,
  articleMeta,
}) => {
  const canonicalUrl = path ? buildUrl(path) : undefined;
  setSEOMeta({
    title,
    description: description || SEO_CONFIG.siteDescription,
    canonicalUrl,
    ogTitle: title,
    ogDescription: description || SEO_CONFIG.siteDescription,
    ogType: type,
    ogImage: image || SEO_CONFIG.defaultOgImage,
    ogImageAlt: imageAlt,
    articleMeta,
    twitterCard:
      image || SEO_CONFIG.defaultOgImage ? 'summary_large_image' : 'summary',
    twitterImage: image || SEO_CONFIG.defaultOgImage,
    robots: noindex ? 'noindex, nofollow' : SEO_CONFIG.defaultRobots,
  });
};
