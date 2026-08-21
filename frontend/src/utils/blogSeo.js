/**
 * Blog SEO utilities — thin wrappers over the centralized SEO system
 * in `utils/seo.js`.
 *
 * These functions are retained for backward compatibility with the
 * BlogPost page, but internally they delegate to `setSEOMeta` / `setPageSEO`
 * which properly creates, updates, and removes tags — fixing the stale
 * tag leak that existed when empty values were skipped.
 */

import { setSEOMeta, setJsonLd, removeJsonLd } from './seo';

/**
 * Strips Markdown to plain text for meta descriptions.
 * @param {string} markdown
 * @param {number} [maxLen=160]
 * @returns {string}
 */
export const stripMarkdown = (markdown, maxLen = 160) => {
  if (!markdown) return '';
  const text = markdown
    .replace(/^```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_~>]/g, '')
    .replace(/^\s*[-*+]\s/gm, '')
    .replace(/^\s*\d+\.\s/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim();

  return text.length > maxLen ? `${text.slice(0, maxLen - 3).trim()}...` : text;
};

/**
 * Sets SEO meta tags for a blog post.
 * Delegates to the centralized `setSEOMeta` which properly handles
 * tag creation AND removal (fixing the stale tag leak).
 *
 * @param {object} params
 * @param {string} params.title - Page title
 * @param {string} [params.description] - Meta description
 * @param {string} [params.canonicalUrl] - Canonical URL (full URL or path)
 * @param {string} [params.ogImage] - Open Graph image URL (empty = remove)
 * @param {string} [params.ogType] - Open Graph type (default: 'article')
 * @param {boolean} [params.noindex] - Whether to add noindex
 * @param {string} [params.author] - Author meta
 * @param {object} [params.articleMeta] - { publishedTime, modifiedTime, author, section, tags }
 */
export const setBlogSeoTags = ({
  title,
  description = '',
  canonicalUrl = '',
  ogImage = '',
  ogType = 'article',
  noindex = false,
  author = '',
  articleMeta,
}) => {
  setSEOMeta({
    title,
    description: description || '',
    canonicalUrl: canonicalUrl || undefined,
    ogTitle: title || '',
    ogDescription: description || '',
    ogType,
    ogImage: ogImage || '',
    titleTemplate: '%s — Portfolio Blog',
    twitterCard: ogImage ? 'summary_large_image' : 'summary',
    twitterTitle: title || '',
    twitterDescription: description || '',
    twitterImage: ogImage || '',
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    author: author || '',
    articleMeta,
  });
};

/**
 * Injects JSON-LD structured data for a BlogPosting/Article.
 * @param {object} params
 * @param {string} params.headline
 * @param {string} [params.description]
 * @param {string} [params.image]
 * @param {Date|string} params.datePublished
 * @param {Date|string} params.dateModified
 * @param {string} [params.author]
 * @param {string} params.url
 * @param {string[]} [params.keywords]
 * @param {string} [params.articleSection]
 */
export const setArticleJsonLd = ({
  headline,
  description = '',
  image = '',
  datePublished,
  dateModified,
  author,
  url,
  keywords,
  articleSection,
}) => {
  if (typeof document === 'undefined') return;

  removeJsonLd('blog-posting-ld');

  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline,
    ...(description && { description }),
    ...(image && { image }),
    ...(datePublished && {
      datePublished: new Date(datePublished).toISOString(),
    }),
    ...(datePublished && {
      dateModified: dateModified
        ? new Date(dateModified).toISOString()
        : new Date(datePublished).toISOString(),
    }),
    ...(author && {
      author: {
        '@type': 'Person',
        name: author,
      },
    }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    ...(keywords && keywords.length > 0 && { keywords: keywords.join(', ') }),
    ...(articleSection && { articleSection }),
  };

  setJsonLd('blog-posting-ld', data);
};

export { removeJsonLd };
