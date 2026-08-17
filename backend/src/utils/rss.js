import RSS from 'rss';
import { env } from '../config/env.js';

const SITE_NAME = 'Portfolio Blog';
const SITE_DESCRIPTION =
  'Technical articles on software engineering, system design, and infrastructure.';

const getSiteUrl = () => {
  let base = env.frontendUrl || 'http://localhost:5173';
  base = base.replace(/\/$/, '');
  return base;
};

export const SITE_CONFIG = {
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  getSiteUrl,
  author: env.auth.admin.name || 'Portfolio Author',
  authorEmail: env.auth.admin.email || 'admin@example.com',
};

const buildFeed = (posts) => {
  const siteUrl = getSiteUrl();

  const feedOptions = {
    title: SITE_CONFIG.name,
    description: SITE_DESCRIPTION,
    feed_url: `${siteUrl}/rss.xml`,
    site_url: siteUrl,
    language: 'en',
    pubDate:
      posts.length > 0
        ? new Date(
            Math.max(...posts.map((p) => new Date(p.publishedAt).getTime())),
          )
        : new Date(),
    ttl: 60,
  };

  const feed = new RSS(feedOptions);

  posts.forEach((post) => {
    const url = `${siteUrl}/blog/${post.slug}`;
    const description = post.excerpt || post.content?.slice(0, 300) || '';

    feed.item({
      title: post.title,
      url,
      guid: post.slug,
      date: post.publishedAt,
      author: post.author || SITE_CONFIG.author,
      category: post.category?.name || 'Uncategorized',
      description,
      custom_elements: [
        {
          tags: post.tags?.map((t) => t.tag.name).join(', ') || '',
        },
      ],
    });
  });

  return feed.xml({ indent: true });
};

export { buildFeed };
