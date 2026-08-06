import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import styles from './LoadingPage.module.css';

/**
 * LoadingPage — full-page loading state used while a route's data loads.
 *
 * @param {Object} props
 * @param {string} [props.label='Loading...'] - Accessible label
 */
function LoadingPage({ label = 'Loading...' }) {
  return (
    <div className={styles.page} role="status" aria-live="polite">
      <LoadingSpinner label={label} size="lg" />
    </div>
  );
}

export default LoadingPage;
