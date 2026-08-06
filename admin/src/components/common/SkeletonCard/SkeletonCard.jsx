import styles from './SkeletonCard.module.css';

/**
 * SkeletonCard — placeholder shimmer for a card while data loads.
 *
 * @param {Object} props
 * @param {number} [props.lines=3] - Number of text lines to render
 */
function SkeletonCard({ lines = 3 }) {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={`${styles.block} ${styles.title}`} />
      <div className={styles.body}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${styles.block} ${styles.line}`}
            style={{ width: `${100 - index * 12}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export default SkeletonCard;
