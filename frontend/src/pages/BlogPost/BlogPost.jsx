import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Container from '../../components/common/Container/Container';
import Heading from '../../components/common/Heading/Heading';
import Tag from '../../components/common/Tag/Tag';
import Button from '../../components/common/Button/Button';
import Reveal from '../../components/common/Reveal/Reveal';
import LoadingState from '../../components/common/LoadingState/LoadingState';
import MarkdownRenderer from '../../components/blog/MarkdownRenderer/MarkdownRenderer';
import TableOfContents from '../../components/blog/TableOfContents/TableOfContents';
import { useBlogPost } from '../../hooks';
import {
  setBlogSeoTags,
  setArticleJsonLd,
  stripMarkdown,
} from '../../utils/blogSeo';
import { setJsonLd, removeJsonLd } from '../../utils/seo';
import { buildUrl } from '../../config/seo';
import { trackBlogPostView } from '../../services/analyticsService';
import styles from './BlogPost.module.css';

/**
 * Generates a table of contents from Markdown headings.
 * Uses the same Markdown renderer's output to extract h2/h3 headings.
 * @param {string} content - Markdown content.
 * @returns {Array<{id: string, text: string, depth: number}>}
 */
const generateToc = (content) => {
  if (!content) return [];

  const lines = content.split('\n');
  const headings = [];
  const usedIds = new Set();

  lines.forEach((line) => {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const depth = match[1].length;
      const text = match[2].trim();
      let id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      let uniqueId = id;
      let counter = 2;
      while (usedIds.has(uniqueId)) {
        uniqueId = `${id}-${counter}`;
        counter += 1;
      }
      usedIds.add(uniqueId);

      headings.push({ id: uniqueId, text, depth });
    }
  });

  return headings;
};

/**
 * Formats a date into a readable string.
 * @param {string} dateStr
 * @returns {string}
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Generates the Twitter/X share URL.
 * @param {string} title
 * @returns {string}
 */
const twitterShareUrl = (title) =>
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`;

/**
 * Generates the LinkedIn share URL.
 * @returns {string}
 */
const linkedinShareUrl = () =>
  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;

/**
 * Copies the current URL to clipboard.
 * @returns {Promise<void>}
 */
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    return true;
  } catch {
    return false;
  }
};

/**
 * Blog detail page — renders a single published article.
 */
function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { post, loading, error, notFound } = useBlogPost(slug);
  const [copied, setCopied] = useState(false);

  const tocHeadings = useMemo(
    () => (post ? generateToc(post.content) : []),
    [post],
  );

  useEffect(() => {
    if (!post) {
      // Reset SEO for 404 state
      removeJsonLd('blog-posting-ld');
      setBlogSeoTags({
        title: 'Article Not Found',
        description: 'The article you are looking for does not exist.',
        canonicalUrl: buildUrl('/blog'),
        noindex: true,
      });
      return;
    }

    // Track blog post view (non-blocking, fire-and-forget)
    trackBlogPostView(post.slug, window.location.pathname);

    const seoTitle = post.seoTitle || post.title;
    const seoDescription =
      post.seoDescription || post.excerpt || stripMarkdown(post.content, 160);
    const canonicalUrl = post.canonicalUrl
      ? buildUrl(post.canonicalUrl)
      : buildUrl(`/blog/${post.slug}`);
    const ogImage = post.coverImage || '';

    const tags =
      post.tags && post.tags.length > 0 ? post.tags.map((t) => t.name) : [];

    setBlogSeoTags({
      title: seoTitle,
      description: seoDescription,
      canonicalUrl,
      ogImage,
      ogType: 'article',
      noindex: post.status !== 'PUBLISHED',
      author: post.author || undefined,
      articleMeta:
        post.status === 'PUBLISHED'
          ? {
              publishedTime: post.publishedAt,
              modifiedTime: post.updatedAt,
              author: post.author || undefined,
              section: post.category?.name || undefined,
              tags,
            }
          : undefined,
    });

    if (post.status === 'PUBLISHED') {
      setArticleJsonLd({
        headline: seoTitle,
        description: seoDescription,
        image: ogImage,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        author: post.author || undefined,
        url: canonicalUrl,
        keywords: tags,
        articleSection: post.category?.name || undefined,
      });
    }

    // Inject BreadcrumbList JSON-LD
    setJsonLd('breadcrumb-ld', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Blog',
          item: buildUrl('/blog'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: post.title,
          item: canonicalUrl,
        },
      ],
    });

    return () => {
      // Cleanup: remove all page-specific tags so they don't leak
      removeJsonLd('blog-posting-ld');
      removeJsonLd('breadcrumb-ld');

      // Reset to blog listing page defaults
      setBlogSeoTags({
        title: 'Blog',
        description:
          'Technical articles on software engineering, system design, and infrastructure.',
        canonicalUrl: buildUrl('/blog'),
        ogImage: '',
        ogType: 'website',
        noindex: false,
      });
    };
  }, [post, slug]);

  if (loading) {
    return <LoadingState label="Loading article..." />;
  }

  if (notFound) {
    return (
      <Container size="sm" className={styles.notFound}>
        <Reveal>
          <div className={styles.notFoundContent}>
            <p className={styles.notFoundCode}>404</p>
            <Heading level={1} alignment="center">
              Article Not Found
            </Heading>
            <p className={styles.notFoundText}>
              The article you are looking for does not exist or has been
              removed.
            </p>
            <Link to="/blog">
              <Button variant="primary" size="md">
                Back to Blog
              </Button>
            </Link>
          </div>
        </Reveal>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="sm" className={styles.error}>
        <Reveal>
          <p className={styles.errorText}>{error}</p>
          <Button variant="outline" size="md" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </Reveal>
      </Container>
    );
  }

  return (
    <article className={styles.article}>
      {/* Article header */}
      <header className={styles.header}>
        <Container>
          {post.category && (
            <Tag variant="info" size="sm" className={styles.categoryTag}>
              {post.category.name}
            </Tag>
          )}

          <Heading level={1} className={styles.title}>
            {post.title}
          </Heading>

          {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}

          <div className={styles.meta}>
            <span className={styles.metaItem}>
              {formatDate(post.publishedAt)}
            </span>
            <span className={styles.metaDivider}>•</span>
            <span className={styles.metaItem}>{post.readingTime} min read</span>
            {post.updatedAt && post.updatedAt !== post.publishedAt && (
              <>
                <span className={styles.metaDivider}>•</span>
                <span className={styles.metaItem}>
                  Updated {formatDate(post.updatedAt)}
                </span>
              </>
            )}
          </div>

          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              className={styles.coverImage}
              loading="eager"
            />
          )}

          {post.author && (
            <div className={styles.author}>
              <span className={styles.authorLabel}>By</span>
              <span className={styles.authorName}>{post.author}</span>
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className={styles.tagList}>
              {post.tags.map((tag) => (
                <Tag key={tag.slug} variant="default" size="sm">
                  {tag.name}
                </Tag>
              ))}
            </div>
          )}
        </Container>
      </header>

      {/* Article body with optional TOC */}
      <div className={styles.body}>
        <Container>
          <div className={styles.contentLayout}>
            {tocHeadings.length > 0 && (
              <aside
                className={styles.tocContainer}
                aria-label="Table of contents"
              >
                <TableOfContents headings={tocHeadings} />
              </aside>
            )}

            <main className={styles.content}>
              <MarkdownRenderer content={post.content} prose />

              <div className={styles.shareSection}>
                <p className={styles.shareTitle}>Share this article:</p>
                <div className={styles.shareButtons}>
                  <a
                    href={twitterShareUrl(post.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share on X / Twitter"
                    className={styles.shareLink}
                  >
                    X / Twitter
                  </a>
                  <a
                    href={linkedinShareUrl(post.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share on LinkedIn"
                    className={styles.shareLink}
                  >
                    LinkedIn
                  </a>
                  <button
                    type="button"
                    className={styles.shareLink}
                    aria-label="Copy link"
                    onClick={async () => {
                      const ok = await copyLink();
                      setCopied(ok);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? 'Copied!' : 'Copy link'}
                  </button>
                </div>
              </div>

              <div className={styles.backLink}>
                <Link to="/blog">
                  <Button variant="outline" size="md">
                    &larr; Back to Blog
                  </Button>
                </Link>
              </div>
            </main>
          </div>
        </Container>
      </div>
    </article>
  );
}

export default BlogPost;
