import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

const formatDate = (dateStr, locale) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const twitterShareUrl = (title) =>
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`;

const linkedinShareUrl = () =>
  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    return true;
  } catch {
    return false;
  }
};

function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { post, loading, error, notFound } = useBlogPost(slug);
  const [copied, setCopied] = useState(false);

  const tocHeadings = useMemo(
    () => (post ? generateToc(post.content) : []),
    [post],
  );

  useEffect(() => {
    if (!post) {
      removeJsonLd('blog-posting-ld');
      setBlogSeoTags({
        title: t('blog.post.notFoundTitle'),
        description: t('blog.post.notFoundText'),
        canonicalUrl: buildUrl('/blog'),
        noindex: true,
      });
      return;
    }

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

    setJsonLd('breadcrumb-ld', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: t('nav.blog'),
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
      removeJsonLd('blog-posting-ld');
      removeJsonLd('breadcrumb-ld');

      setBlogSeoTags({
        title: t('blog.title'),
        description: t('blog.seoDescription'),
        canonicalUrl: buildUrl('/blog'),
        ogImage: '',
        ogType: 'website',
        noindex: false,
      });
    };
  }, [post, slug, t, i18n.language]);

  if (loading) {
    return <LoadingState label={t('blog.post.loading')} />;
  }

  if (notFound) {
    return (
      <Container size="sm" className={styles.notFound}>
        <Reveal>
          <div className={styles.notFoundContent}>
            <p className={styles.notFoundCode}>404</p>
            <Heading level={1} alignment="center">
              {t('blog.post.notFoundTitle')}
            </Heading>
            <p className={styles.notFoundText}>
              {t('blog.post.notFoundText')}
            </p>
            <Link to="/blog">
              <Button variant="primary" size="md">
                {t('common.backToBlog')}
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
            {t('blog.post.goHome')}
          </Button>
        </Reveal>
      </Container>
    );
  }

  const locale = i18n.resolvedLanguage || i18n.language;

  return (
    <article className={styles.article}>
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
              {formatDate(post.publishedAt, locale)}
            </span>
            <span className={styles.metaDivider}>•</span>
            <span className={styles.metaItem}>
              {t('blog.post.readTime', { minutes: post.readingTime })}
            </span>
            {post.updatedAt && post.updatedAt !== post.publishedAt && (
              <>
                <span className={styles.metaDivider}>•</span>
                <span className={styles.metaItem}>
                  {t('blog.post.updated', {
                    date: formatDate(post.updatedAt, locale),
                  })}
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
              decoding="async"
              width="1200"
              height="630"
              style={{ aspectRatio: '1200/630' }}
            />
          )}

          {post.author && (
            <div className={styles.author}>
              <span className={styles.authorLabel}>{t('blog.post.by')}</span>
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

      <div className={styles.body}>
        <Container>
          <div className={styles.contentLayout}>
            {tocHeadings.length > 0 && (
              <aside
                className={styles.tocContainer}
                aria-label={t('blog.post.contents')}
              >
                <TableOfContents headings={tocHeadings} />
              </aside>
            )}

            <main className={styles.content}>
              <MarkdownRenderer content={post.content} prose />

              <div className={styles.shareSection}>
                <p className={styles.shareTitle}>{t('blog.post.share')}</p>
                <div className={styles.shareButtons}>
                  <a
                    href={twitterShareUrl(post.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t('blog.post.shareTwitter')}
                    className={styles.shareLink}
                  >
                    X / Twitter
                  </a>
                  <a
                    href={linkedinShareUrl(post.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t('blog.post.shareLinkedin')}
                    className={styles.shareLink}
                  >
                    LinkedIn
                  </a>
                  <button
                    type="button"
                    className={styles.shareLink}
                    aria-label={t('blog.post.copyLink')}
                    onClick={async () => {
                      const ok = await copyLink();
                      setCopied(ok);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? t('blog.post.copied') : t('blog.post.copyLink')}
                  </button>
                </div>
              </div>

              <div className={styles.backLink}>
                <Link to="/blog">
                  <Button variant="outline" size="md">
                    &larr; {t('common.backToBlog')}
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
