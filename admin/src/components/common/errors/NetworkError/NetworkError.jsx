import styles from './NetworkError.module.css';

/**
 * NetworkError — full-state notice shown when the server is unreachable.
 *
 * @param {Object} props
 * @param {() => void} [onRetry] - Retry callback.
 */
function NetworkError({ onRetry }) {
  return (
    <div className={styles.wrapper} role="alert">
      <span className={styles.icon} aria-hidden="true">
        📡
      </span>
      <h2 className={styles.title}>Connection lost</h2>
      <p className={styles.message}>
        We could not reach the server. Check your internet connection and try
        again.
      </p>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export default NetworkError;
