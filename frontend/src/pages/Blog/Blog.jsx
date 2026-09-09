import { useEffect } from 'react';
import Container from '../../components/common/Container/Container';
import BlogHero from '../../components/blog/BlogHero/BlogHero';
import BlogList from '../../components/blog/BlogList/BlogList';
import { setPageSEO } from '../../utils/seo';
import styles from './Blog.module.css';

function Blog() {
  useEffect(() => {
    setPageSEO({
      title: 'Blog',
      description:
        'Practical articles on backend engineering, system design, databases, cloud infrastructure, JavaScript, and other areas of computer science.',
      path: '/blog',
      type: 'website',
    });
  }, []);

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