import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Container from '../../components/common/Container/Container';
import Heading from '../../components/common/Heading/Heading';
import Section from '../../components/common/Section/Section';
import LoadingState from '../../components/common/LoadingState/LoadingState';
import BlogList from '../../components/blog/BlogList/BlogList';
import { fetchBlogTags } from '../../services/index.js';
import styles from './TagPosts.module.css';

function TagPosts() {
  const { slug } = useParams();
  const [tag, setTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    fetchBlogTags(controller.signal)
      .then((tags) => {
        if (!cancelled) {
          const found = tags.find((t) => t.slug === slug);
          if (found) {
            setTag(found);
          } else {
            setError('Tag not found');
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (err.name === 'AbortError' || err.name === 'CanceledError') {
            return;
          }
          setError(err.message || 'Failed to load tag');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [slug]);

  if (loading) {
    return <LoadingState label="Loading tag..." />;
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
        title={tag ? `#${tag.name}` : 'Tag'}
        subtitle=""
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
          initialQuery={{ tag: slug }}
          showSearch={false}
          showCategoryFilter={false}
          showTagCloud={false}
        />
      </Container>
    </div>
  );
}

export default TagPosts;
