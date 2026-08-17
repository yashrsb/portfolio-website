/**
 * Manages dynamic SEO meta tags for blog pages.
 * Uses the existing document-meta pattern (no heavy SEO framework).
 *
 * @param {object} params
 * @param {string} params.title - Page title
 * @param {string} [params.description] - Meta description
 * @param {string} [params.canonicalUrl] - Canonical URL (full URL or path)
 * @param {string} [params.ogImage] - Open Graph image URL
 * @param {string} [params.ogType] - Open Graph type (default: 'article')
 * @param {boolean} [params.noindex] - Whether to add noindex
 */
export const setBlogSeoTags = ({
  title,
  description = '',
  canonicalUrl = '',
  ogImage = '',
  ogType = 'article',
  noindex = false,
}) => {
  if (typeof document === 'undefined') return;

  const fullTitle = title ? `${title} — Portfolio Blog` : 'Blog — Portfolio';
  document.title = fullTitle;

  const setMeta = (name, content) => {
    if (!content) return;
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.name = name;
      document.querySelector('head').appendChild(tag);
    }
    tag.content = content;
  };

  const setOg = (property, content) => {
    if (!content) return;
    let tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.property = property;
      document.querySelector('head').appendChild(tag);
    }
    tag.content = content;
  };

  setMeta('description', description);
  setOg('og:title', title || '');
  setOg('og:description', description);
  setOg('og:type', ogType);

  if (ogImage) {
    setOg('og:image', ogImage);
    setOg('og:image:width', '1200');
    setOg('og:image:height', '630');
  }

  setOg('og:site', window.location.origin);
  setOg('og:url', canonicalUrl || window.location.href);

  // Twitter/X card
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', title || '');
  setMeta('twitter:description', description);
  if (ogImage) {
    setMeta('twitter:image', ogImage);
  }

  // Canonical
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.querySelector('head').appendChild(canonical);
  }
  canonical.href = canonicalUrl || window.location.href;

  // noindex
  let robots = document.querySelector('meta[name="robots"]');
  if (!robots) {
    robots = document.createElement('meta');
    robots.name = 'robots';
    document.querySelector('head').appendChild(robots);
  }
  robots.content = noindex ? 'noindex, nofollow' : 'index, follow';
};

/**
 * Removes a JSON-LD structured data script tag.
 */
export const removeJsonLd = (id) => {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById(id);
  if (existing) existing.remove();
};

/**
 * Injects JSON-LD structured data for a BlogPosting.
 * @param {object} params
 * @param {string} params.headline
 * @param {string} [params.description]
 * @param {string} [params.image]
 * @param {Date|string} params.datePublished
 * @param {Date|string} params.dateModified
 * @param {string} [params.author]
 * @param {string} params.url
 */
export const setArticleJsonLd = ({
  headline,
  description = '',
  image = '',
  datePublished,
  dateModified,
  author = 'Portfolio Author',
  url,
}) => {
  if (typeof document === 'undefined') return;

  removeJsonLd('blog-posting-ld');

  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline,
    description,
    image,
    datePublished: new Date(datePublished).toISOString(),
    dateModified: new Date(dateModified).toISOString(),
    author: {
      '@type': 'Person',
      name: author,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  const script = document.createElement('script');
  script.id = 'blog-posting-ld';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.querySelector('head').appendChild(script);
};

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
