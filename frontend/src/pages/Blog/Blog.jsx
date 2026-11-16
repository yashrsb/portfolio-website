import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/common/Container/Container';
import BlogHero from '../../components/blog/BlogHero/BlogHero';
import BlogList from '../../components/blog/BlogList/BlogList';
import { setPageSEO } from '../../utils/seo';
import styles from './Blog.module.css';

function Blog() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setPageSEO({
      title: t('blog.title'),
      description: t('blog.seoDescription'),
      path: '/blog',
      type: 'website',
    });
  }, [t, i18n.language]);

  return (
    <div className={styles.page}>
      <BlogHero />

      <Container>
        <BlogList />
      </Container>
    </div>
  );
}

export default Blog;