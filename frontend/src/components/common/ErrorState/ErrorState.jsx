import { useTranslation } from 'react-i18next';
import styles from './ErrorState.module.css';

/**
 * ErrorState — centered error message for async page data.
 *
 * @param {Object} props
 * @param {string} [props.title] - Error title
 * @param {string} [props.message=''] - Error message
 */
function ErrorState({ title, message = '', onRetry, retryLabel }) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('common.somethingWentWrong');
  const resolvedRetry = retryLabel ?? t('common.retry');
  return (
    <div className={styles.wrapper} role="alert">
      <span className={styles.icon} aria-hidden="true">
        ⚠️
      </span>
      <h2 className={styles.title}>{resolvedTitle}</h2>
      {message && <p className={styles.message}>{message}</p>}
      {onRetry && (
        <button
          type="button"
          className={styles.retryButton}
          onClick={onRetry}
          aria-label={resolvedRetry}
        >
          {resolvedRetry}
        </button>
      )}
    </div>
  );
}

export default ErrorState;
