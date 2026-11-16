import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Container from '../../components/common/Container/Container';
import Heading from '../../components/common/Heading/Heading';
import Button from '../../components/common/Button/Button';
import Reveal from '../../components/common/Reveal/Reveal';
import { setPageSEO } from '../../utils/seo';
import { buildUrl } from '../../config/seo';
import styles from './NotFound.module.css';

function NotFound() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setPageSEO({
      title: t('notFound.title'),
      description: t('notFound.seoDescription'),
      path: buildUrl(window.location.pathname),
      noindex: true,
    });
  }, [t, i18n.language]);

  return (
    <Container size="sm">
      <Reveal>
        <div className={styles.wrapper}>
          <p className={styles.code}>404</p>
          <Heading level={1} alignment="center">
            {t('notFound.title')}
          </Heading>
          <p className={styles.text}>{t('notFound.text')}</p>
          <Link to="/">
            <Button variant="primary" size="lg">
              {t('common.backToHome')}
            </Button>
          </Link>
        </div>
      </Reveal>
    </Container>
  );
}

export default NotFound;
