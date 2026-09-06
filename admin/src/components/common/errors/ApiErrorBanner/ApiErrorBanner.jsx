import styles from './ApiErrorBanner.module.css';

/**
 * Derives a user-friendly title from a normalized ApiError.
 * Prefers the most specific available signal so the banner reads as
 * "Validation failed", "Conflict", etc. instead of the generic
 * "Something went wrong" when the status is known.
 * @param {import('../../../../services/types.js').ApiError} error
 * @returns {string}
 */
const titleFor = (error) => {
  if (error.isNetworkError) return 'Network error';
  if (error.isAuthError) return 'Authorization required';
  if (error.status === 409) return 'Conflict';
  if (error.status === 400 || error.status === 422) return 'Validation failed';
  if (error.status === 404) return 'Not found';
  if (error.status >= 500) return 'Server error';
  return 'Something went wrong';
};

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

  const title = titleFor(error);

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
