import { Link } from 'react-router-dom';
import styles from './NotAuthorized.module.css';

/**
 * NotAuthorized — full-state notice shown when a user lacks permission.
 *
 * @param {Object} props
 * @param {string} [props.message='You do not have permission to view this page.'] - Explanation.
 */
function NotAuthorized({
  message = 'You do not have permission to view this page.',
}) {
  return (
    <div className={styles.wrapper} role="alert">
      <span className={styles.icon} aria-hidden="true">
        🔒
      </span>
      <h2 className={styles.title}>Access denied</h2>
      <p className={styles.message}>{message}</p>
      <Link className={styles.link} to="/dashboard">
        Back to dashboard
      </Link>
    </div>
  );
}

export default NotAuthorized;
