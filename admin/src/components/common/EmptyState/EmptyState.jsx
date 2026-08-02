import styles from './EmptyState.module.css';

/**
 * EmptyState — centered placeholder for empty listings.
 *
 * @param {Object} props
 * @param {string} [props.title='Nothing here yet'] - Title text
 * @param {string} [props.description=''] - Description text
 * @param {React.ReactNode} [props.action] - Optional action button
 * @param {string} [props.icon='📭'] - Icon/emoji to display
 */
function EmptyState({
  title = 'Nothing here yet',
  description = '',
  action,
  icon = '📭',
}) {
  return (
    <div className={styles.emptyState}>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

export default EmptyState;
