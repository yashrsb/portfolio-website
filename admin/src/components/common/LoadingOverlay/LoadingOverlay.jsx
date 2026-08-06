import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import styles from './LoadingOverlay.module.css';

/**
 * LoadingOverlay — covers an element while a background operation runs.
 * Overlays do not block scroll; the parent should control positioning.
 *
 * @param {Object} props
 * @param {boolean} [props.active=false] - Whether the overlay is visible
 * @param {string} [props.label='Loading...'] - Accessible label
 */
function LoadingOverlay({ active = false, label = 'Loading...' }) {
  if (!active) return null;

  return (
    <div className={styles.overlay} role="status" aria-live="polite">
      <LoadingSpinner label={label} />
    </div>
  );
}

export default LoadingOverlay;
