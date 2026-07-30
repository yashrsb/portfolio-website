import styles from './Button.module.css';

/**
 * @typedef {'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'} ButtonVariant
 * @typedef {'sm' | 'md' | 'lg'} ButtonSize
 */

/**
 * Reusable Button component.
 *
 * @param {Object} props
 * @param {ButtonVariant} [props.variant='primary'] - Visual style variant
 * @param {ButtonSize} [props.size='md'] - Size preset
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.loading=false] - Loading state (shows spinner)
 * @param {() => void} [props.onClick] - Click handler
 * @param {'button' | 'submit' | 'reset'} [props.type='button'] - Button type
 * @param {React.ReactNode} [props.children] - Button content
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.ariaLabel] - Accessibility label
 */
function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  children,
  className = '',
  ariaLabel,
}) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    loading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      <span className={loading ? styles.labelHidden : ''}>{children}</span>
    </button>
  );
}

export default Button;
