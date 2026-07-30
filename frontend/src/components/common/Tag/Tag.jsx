import styles from './Tag.module.css';

/**
 * @typedef {'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'default'} TagVariant
 */

/**
 * Small badge/tag component for displaying labels like technologies or statuses.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Tag content
 * @param {TagVariant} [props.variant='default'] - Color variant
 * @param {'sm' | 'md'} [props.size='sm'] - Size preset
 * @param {boolean} [props.removable=false] - Whether to show a remove button
 * @param {() => void} [props.onRemove] - Remove handler (only if removable)
 * @param {string} [props.className] - Additional CSS classes
 */
function Tag({
  children,
  variant = 'default',
  size = 'sm',
  removable = false,
  onRemove,
  className = '',
}) {
  const classNames = [
    styles.tag,
    styles[variant],
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classNames}>
      <span className={styles.label}>{children}</span>
      {removable && (
        <button
          type="button"
          className={styles.remove}
          onClick={onRemove}
          aria-label={`Remove ${children}`}
        >
          &times;
        </button>
      )}
    </span>
  );
}

export default Tag;
