import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './ProjectCard.module.css';
import Tag from '../../common/Tag/Tag';
import Button from '../../common/Button/Button';

function ProjectCard({
  title,
  description,
  tags = [],
  slug,
  featured = false,
  status,
  githubUrl,
  liveUrl,
  imageUrl,
  imageAlt = '',
  className = '',
}) {
  const { t } = useTranslation();
  const classNames = [styles.card, className].filter(Boolean).join(' ');

  const statusLabel =
    status === 'live'
      ? t('common.live')
      : status === 'wip'
        ? t('common.wip')
        : status === 'archived'
          ? t('common.archived')
          : status;

  return (
    <article className={classNames}>
      <div className={styles.imageWrapper}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt}
            className={styles.image}
            loading="lazy"
            decoding="async"
            width="400"
            height="240"
            style={{ aspectRatio: '5/3' }}
          />
        ) : (
          <div className={styles.placeholder} aria-hidden="true">
            <span className={styles.placeholderIcon}>📁</span>
          </div>
        )}

        <div className={styles.badges}>
          {featured && (
            <Tag variant="primary" size="sm">
              {t('common.featured')}
            </Tag>
          )}
          {status && (
            <Tag
              variant={
                status === 'live'
                  ? 'success'
                  : status === 'wip'
                    ? 'warning'
                    : 'default'
              }
              size="sm"
            >
              {statusLabel}
            </Tag>
          )}
        </div>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>

        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag) => (
              <Tag key={tag} variant="default" size="sm">
                {tag}
              </Tag>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          {githubUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(githubUrl, '_blank', 'noopener noreferrer')
              }
              ariaLabel={`View ${title} source code on GitHub`}
            >
              {t('common.github')}
            </Button>
          )}
          {liveUrl && (
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                window.open(liveUrl, '_blank', 'noopener noreferrer')
              }
              ariaLabel={`View ${title} live demo`}
            >
              {t('common.liveDemo')}
            </Button>
          )}
          {slug && (
            <Link
              to={`/projects/${slug}`}
              className={styles.caseStudyLink}
              ariaLabel={`View ${title} case study`}
            >
              {t('common.viewCaseStudy')}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProjectCard;
