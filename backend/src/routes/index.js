import { Router } from 'express';
import v1Routes from './v1/index.js';
import { env } from '../config/env.js';
import blogService from '../services/blogService.js';
import { getProjectSlugs } from '../services/portfolioService.js';
import { buildFeed, SITE_CONFIG } from '../utils/rss.js';
import logger from '../utils/logger.js';

const router = Router();

const getSiteUrl = () => {
  let base = SITE_CONFIG.getSiteUrl();
  base = base.replace(/\/$/, '');
  return base;
};

/**
 * Sitemap XML generator — includes all static pages, project detail pages,
 * and published blog post URLs.
 *
 * Excludes: admin routes, login, 404, draft/unpublished posts,
 * deleted/nonexistent projects.
 */
const generateSitemapXml = async () => {
  const siteUrl = getSiteUrl();
  const lastmod = new Date().toISOString().slice(0, 10);

  const urls = [
    { loc: `${siteUrl}/`, lastmod, priority: 1.0, changefreq: 'weekly' },
    { loc: `${siteUrl}/about`, lastmod, priority: 0.8, changefreq: 'monthly' },
    {
      loc: `${siteUrl}/experience`,
      lastmod,
      priority: 0.8,
      changefreq: 'monthly',
    },
    { loc: `${siteUrl}/skills`, lastmod, priority: 0.8, changefreq: 'monthly' },
    {
      loc: `${siteUrl}/projects`,
      lastmod,
      priority: 0.9,
      changefreq: 'weekly',
    },
    {
      loc: `${siteUrl}/education`,
      lastmod,
      priority: 0.6,
      changefreq: 'monthly',
    },
    {
      loc: `${siteUrl}/contact`,
      lastmod,
      priority: 0.7,
      changefreq: 'monthly',
    },
    { loc: `${siteUrl}/blog`, lastmod, priority: 0.9, changefreq: 'daily' },
  ];

  // Project detail pages — generated from database slugs
  const projectSlugs = await getProjectSlugs();
  projectSlugs.forEach((project) => {
    const projLastmod = (project.updatedAt || new Date())
      .toISOString()
      .slice(0, 10);
    urls.push({
      loc: `${siteUrl}/projects/${project.slug}`,
      lastmod: projLastmod,
      priority: 0.7,
      changefreq: 'monthly',
    });
  });

  // Published blog posts
  const blogSlugs = await blogService.getAllPublishedSlugs();
  blogSlugs.forEach((post) => {
    const postLastmod = (post.publishedAt || post.updatedAt || new Date())
      .toISOString()
      .slice(0, 10);
    urls.push({
      loc: `${siteUrl}/blog/${post.slug}`,
      lastmod: postLastmod,
      priority: 0.6,
      changefreq: 'monthly',
    });
  });

  // Blog categories — only those with published posts
  const categories = await blogService.getCategories();
  const catLastmods = {};
  for (const cat of categories) {
    try {
      const result = await blogService.getPostsByCategory(cat.slug, {
        limit: 1,
      });
      if (result.posts && result.posts.length > 0) {
        catLastmods[cat.slug] = cat.updatedAt;
      }
    } catch {
      // Skip categories without published posts
    }
  }
  Object.entries(catLastmods).forEach(([slug, updatedAt]) => {
    const catLastmod = (updatedAt || new Date()).toISOString().slice(0, 10);
    urls.push({
      loc: `${siteUrl}/blog/category/${slug}`,
      lastmod: catLastmod,
      priority: 0.5,
      changefreq: 'monthly',
    });
  });

  // Blog tags — only those with published posts
  const tags = await blogService.getTags();
  const tagLastmods = {};
  for (const tag of tags) {
    try {
      const result = await blogService.getPostsByTag(tag.slug, { limit: 1 });
      if (result.posts && result.posts.length > 0) {
        tagLastmods[tag.slug] = tag.updatedAt;
      }
    } catch {
      // Skip tags without published posts
    }
  }
  Object.entries(tagLastmods).forEach(([slug, updatedAt]) => {
    const tagLastmod = (updatedAt || new Date()).toISOString().slice(0, 10);
    urls.push({
      loc: `${siteUrl}/blog/tag/${slug}`,
      lastmod: tagLastmod,
      priority: 0.5,
      changefreq: 'monthly',
    });
  });

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  urls.forEach((url) => {
    xml += '  <url>\n';
    xml += `    <loc>${url.loc}</loc>\n`;
    if (url.lastmod) xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
    if (url.changefreq)
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>\n';
  return xml;
};

/**
 * Root-level RSS feed (not under API prefix).
 */
router.get('/rss.xml', async (req, res) => {
  try {
    const posts = await blogService.getAllPublishedForFeed(50);
    const feed = buildFeed(posts);

    res.set({
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=300, stale-while-revalidate=60',
    });
    res.status(200).send(feed);
  } catch (err) {
    logger.error('RSS feed generation failed', { error: err.message });
    res.status(500).send('RSS feed generation failed');
  }
});

/**
 * Root-level sitemap.xml.
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    const xml = await generateSitemapXml();
    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=300',
    });
    res.status(200).send(xml);
  } catch (err) {
    logger.error('Sitemap generation failed', { error: err.message });
    res.status(500).send('Sitemap generation failed');
  }
});

/**
 * Root-level robots.txt.
 * References the production sitemap URL and disallows admin/private routes.
 */
router.get('/robots.txt', (req, res) => {
  res.set({ 'Content-Type': 'text/plain; charset=utf-8' });
  res
    .status(200)
    .send(
      [
        'User-agent: *',
        'Allow: /',
        '',
        'Disallow: /admin/',
        'Disallow: /api/v1/admin',
        'Disallow: /login',
        'Disallow: /api/v1/auth',
        '',
        `Sitemap: ${getSiteUrl()}/sitemap.xml`,
        '',
      ].join('\n'),
    );
});

/**
 * Versioned API router. Mounts v1 routes under the configured prefix.
 */
router.use(env.apiPrefix, v1Routes);

export default router;
