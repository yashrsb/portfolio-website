import styles from './LoadingState.module.css';

/**
 * LoadingState — centered loading indicator for async page data.
 *
 * @param {Object} props
 * @param {string} [props.label='Loading...'] - Accessible label
 */
function LoadingState({ label = 'Loading...' }) {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </div>
  );
}

export default LoadingState;
