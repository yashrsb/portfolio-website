import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Container from '../../components/common/Container/Container';
import Heading from '../../components/common/Heading/Heading';
import Section from '../../components/common/Section/Section';
import LoadingState from '../../components/common/LoadingState/LoadingState';
import BlogList from '../../components/blog/BlogList/BlogList';
import { fetchBlogCategories } from '../../services/index.js';
import styles from './CategoryPosts.module.css';

function CategoryPosts() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    fetchBlogCategories(controller.signal)
      .then((categories) => {
        if (!cancelled) {
          const found = categories.find((c) => c.slug === slug);
          if (found) {
            setCategory(found);
          } else {
            setError('Category not found');
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (err.name === 'AbortError' || err.name === 'CanceledError') {
            return;
          }
          setError(err.message || 'Failed to load category');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [slug]);

  if (loading) {
    return <LoadingState label="Loading category..." />;
  }

  if (error) {
    return (
      <Container size="sm" className={styles.error}>
        <Heading level={1} alignment="center">
          {error}
        </Heading>
        <Link to="/blog">
          <button type="button" className={styles.backButton}>
            Back to Blog
          </button>
        </Link>
      </Container>
    );
  }

  return (
    <div className={styles.page}>
      <Section
        title={category?.name || 'Category'}
        subtitle={category?.description || ''}
        background="alt"
      >
        <Container>
          <Link to="/blog" className={styles.backLink}>
            &larr; Back to Blog
          </Link>
        </Container>
      </Section>

      <Container>
        <BlogList
          initialQuery={{ category: slug }}
          showSearch={false}
          showCategoryFilter={false}
        />
      </Container>
    </div>
  );
}

export default CategoryPosts;
