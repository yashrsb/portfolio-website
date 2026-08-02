import { Link } from 'react-router-dom';
import Button from '../../components/common/Button/Button';
import styles from './NotFoundPage.module.css';

/**
 * NotFoundPage — 404 fallback for unknown admin routes.
 */
function NotFoundPage() {
  return (
    <div className={styles.page}>
      <p className={styles.code} aria-hidden="true">
        404
      </p>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.description}>
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link to="/dashboard" className={styles.link}>
        <Button>Go to Dashboard</Button>
      </Link>
    </div>
  );
}

export default NotFoundPage;
