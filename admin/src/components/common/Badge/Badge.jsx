import styles from './Badge.module.css';

/**
 * @typedef {'neutral' | 'success' | 'warning' | 'danger' | 'info'} BadgeVariant
 */

/**
 * Badge — small status indicator.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.children] - Badge content
 * @param {BadgeVariant} [props.variant='neutral'] - Visual variant
 * @param {string} [props.label] - Accessible label when children is decorative
 */
function Badge({ children, variant = 'neutral', label }) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`} aria-label={label}>
      {children}
    </span>
  );
}

export default Badge;
