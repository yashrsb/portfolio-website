import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../common/Card/Card';
import Tag from '../../common/Tag/Tag';
import styles from './BlogPostCard.module.css';

const formatDate = (dateStr, locale) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

function BlogPostCard({ post }) {
  const { t, i18n } = useTranslation();
  return (
    <Card className={styles.card} shadow="sm" hoverable>
      <Link to={`/blog/${post.slug}`} className={styles.cardLink}>
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className={styles.cardImage}
            loading="lazy"
            decoding="async"
            width="400"
            height="240"
            style={{ aspectRatio: '5/3' }}
          />
        )}
        <div className={styles.cardContent}>
          {post.featured && (
            <span
              className={styles.featuredBadge}
              aria-label={t('blog.card.featured')}
              title={t('blog.card.featured')}
            >
              {t('blog.card.featured')}
            </span>
          )}

          {post.category && (
            <Tag variant="info" size="sm" className={styles.categoryTag}>
              {post.category.name}
            </Tag>
          )}

          <h3 className={styles.cardTitle}>{post.title}</h3>

          {post.excerpt && <p className={styles.cardExcerpt}>{post.excerpt}</p>}

          <div className={styles.cardMeta}>
            <span className={styles.cardDate}>
              {formatDate(post.publishedAt, i18n.resolvedLanguage)}
            </span>
            <span className={styles.cardReadTime}>
              {t('blog.card.readTime', { minutes: post.readingTime })}
            </span>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className={styles.cardTags}>
              {post.tags.slice(0, 3).map((tag) => (
                <Tag key={tag.slug} variant="default" size="sm">
                  {tag.name}
                </Tag>
              ))}
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
}

export default BlogPostCard;
