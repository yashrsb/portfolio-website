import styles from './ProjectCard.module.css';
import Tag from '../../common/Tag/Tag';
import Button from '../../common/Button/Button';

/**
 * @typedef {'live' | 'wip' | 'archived'} ProjectStatus
 */

/**
 * Project card with image placeholder, title, description, tech tags, and action buttons.
 *
 * @param {Object} props
 * @param {string} props.title - Project title
 * @param {string} props.description - Short project description
 * @param {string[]} props.tags - Technology tags (e.g., ["React", "Node.js"])
 * @param {boolean} [props.featured=false] - Whether to show a featured badge
 * @param {ProjectStatus} [props.status] - Optional status badge
 * @param {string} [props.githubUrl] - GitHub repository URL
 * @param {string} [props.liveUrl] - Live demo URL
 * @param {string} [props.imageUrl] - Optional image URL (if omitted, shows placeholder)
 * @param {string} [props.imageAlt] - Alt text for the image
 * @param {string} [props.className] - Additional CSS classes
 */
function ProjectCard({
  title,
  description,
  tags = [],
  featured = false,
  status,
  githubUrl,
  liveUrl,
  imageUrl,
  imageAlt = '',
  className = '',
}) {
  const classNames = [styles.card, className].filter(Boolean).join(' ');

  return (
    <article className={classNames}>
      {/* Image / Placeholder */}
      <div className={styles.imageWrapper}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.placeholder} aria-hidden="true">
            <span className={styles.placeholderIcon}>📁</span>
          </div>
        )}

        {/* Badges */}
        <div className={styles.badges}>
          {featured && (
            <Tag variant="primary" size="sm">
              Featured
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
              {status === 'live'
                ? 'Live'
                : status === 'wip'
                  ? 'WIP'
                  : 'Archived'}
            </Tag>
          )}
        </div>
      </div>

      {/* Content */}
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

        {/* Actions */}
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
              GitHub
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
              Live Demo
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProjectCard;
