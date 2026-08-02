import styles from './LoadingSpinner.module.css';

/**
 * LoadingSpinner — accessible loading indicator.
 *
 * @param {Object} props
 * @param {string} [props.label='Loading...'] - Accessible label
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Size preset
 * @param {boolean} [props.fullScreen=false] - Centers in the viewport
 */
function LoadingSpinner({
  label = 'Loading...',
  size = 'md',
  fullScreen = false,
}) {
  const wrapperClass = fullScreen
    ? `${styles.wrapper} ${styles.fullScreen}`
    : styles.wrapper;

  return (
    <div
      className={wrapperClass}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span
        className={`${styles.spinner} ${styles[size]}`}
        aria-hidden="true"
      />
      <span className={styles.label}>{label}</span>
    </div>
  );
}

export default LoadingSpinner;
