import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../../components/common/Container/Container';
import Heading from '../../components/common/Heading/Heading';
import Button from '../../components/common/Button/Button';
import Reveal from '../../components/common/Reveal/Reveal';
import styles from './NotFound.module.css';

/**
 * NotFound page — 404 fallback for unknown routes.
 * Content fades in with a gentle entrance animation.
 */
function NotFound() {
  useEffect(() => {
    document.title = 'Page Not Found — Alex Chen';
  }, []);

  return (
    <Container size="sm">
      <Reveal>
        <div className={styles.wrapper}>
          <p className={styles.code}>404</p>
          <Heading level={1} alignment="center">
            Page Not Found
          </Heading>
          <p className={styles.text}>
            The page you are looking for does not exist or has been moved.
          </p>
          <Link to="/">
            <Button variant="primary" size="lg">
              Back to Home
            </Button>
          </Link>
        </div>
      </Reveal>
    </Container>
  );
}

export default NotFound;

