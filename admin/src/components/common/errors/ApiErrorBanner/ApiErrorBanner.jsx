import styles from './ApiErrorBanner.module.css';

/**
 * ApiErrorBanner — displays a normalized ApiError with a retry action.
 *
 * @param {Object} props
 * @param {import('../../../../services/types.js').ApiError} error - The error to display.
 * @param {() => void} [onRetry] - Optional retry callback.
 * @param {string} [retryLabel='Try again'] - Text for the retry button.
 */
function ApiErrorBanner({ error, onRetry, retryLabel = 'Try again' }) {
  if (!error) return null;

  const title = error.isNetworkError
    ? 'Network error'
    : error.isAuthError
      ? 'Authorization required'
      : 'Something went wrong';

  return (
    <div className={styles.banner} role="alert">
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        {error.message && <p className={styles.message}>{error.message}</p>}
        {error.fieldErrors.length > 0 && (
          <ul className={styles.fieldList}>
            {error.fieldErrors.map((fieldError) => (
              <li key={fieldError.field}>
                <strong>{fieldError.field}:</strong> {fieldError.message}
              </li>
            ))}
          </ul>
        )}
      </div>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  );
}

export default ApiErrorBanner;
