import { Router } from 'express';
import v1Routes from './v1/index.js';
import { env } from '../config/env.js';
import blogService from '../services/blogService.js';
import { buildFeed, SITE_CONFIG } from '../utils/rss.js';
import logger from '../utils/logger.js';

const router = Router();

/**
 * Sitemap XML generator — includes static pages + blog posts.
 */
const generateSitemapXml = async () => {
  const siteUrl = SITE_CONFIG.getSiteUrl();
  const blogSlugs = await blogService.getAllPublishedSlugs();

  const urls = [
    { loc: `${siteUrl}/`, lastmod: new Date().toISOString(), priority: 1.0 },
    { loc: `${siteUrl}/about`, priority: 0.8 },
    { loc: `${siteUrl}/projects`, priority: 0.8 },
    { loc: `${siteUrl}/blog`, priority: 0.8 },
  ];

  blogSlugs.forEach((post) => {
    urls.push({
      loc: `${siteUrl}/blog/${post.slug}`,
      lastmod: (post.publishedAt || post.updatedAt).toISOString(),
      priority: 0.6,
    });
  });

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  urls.forEach((url) => {
    xml += '  <url>\n';
    xml += `    <loc>${url.loc}</loc>\n`;
    if (url.lastmod) xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
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
 */
router.get('/robots.txt', (req, res) => {
  res.set({ 'Content-Type': 'text/plain; charset=utf-8' });
  res
    .status(200)
    .send(
      'User-agent: *\n' +
        'Allow: /\n' +
        'Disallow: /admin\n' +
        'Disallow: /login\n' +
        '\n' +
        'Sitemap: ' +
        env.frontendUrl +
        '/sitemap.xml\n',
    );
});

/**
 * Versioned API router. Mounts v1 routes under the configured prefix.
 */
router.use(env.apiPrefix, v1Routes);

export default router;
