import { useTranslation } from 'react-i18next';
import styles from './LoadingState.module.css';

/**
 * LoadingState — centered loading indicator for async page data.
 *
 * @param {Object} props
 * @param {string} [props.label] - Accessible label
 */
function LoadingState({ label }) {
  const { t } = useTranslation();
  const text = label ?? t('common.loading');
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.label}>{text}</span>
    </div>
  );
}

export default LoadingState;
