import styles from './SkeletonTable.module.css';

/**
 * SkeletonTable — placeholder shimmer for a data table while loading.
 *
 * @param {Object} props
 * @param {number} [props.rows=5] - Number of body rows to render
 * @param {number} [props.columns=4] - Number of columns per row
 */
function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <div className={styles.table} aria-hidden="true">
      <div className={styles.header}>
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className={`${styles.block} ${styles.headerCell}`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div className={styles.row} key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className={`${styles.block} ${styles.cell}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default SkeletonTable;
