import { useEffect } from 'react';
import Container from '../../components/common/Container/Container';
import Section from '../../components/common/Section/Section';
import BlogList from '../../components/blog/BlogList/BlogList';
import { setJsonLd, setPageSEO } from '../../utils/seo';
import { buildUrl } from '../../config/seo';
import styles from './Blog.module.css';

function Blog() {
  useEffect(() => {
    setPageSEO({
      title: 'Blog',
      description:
        'Technical articles on software engineering, system design, and infrastructure.',
      path: '/blog',
      type: 'website',
    });

    setJsonLd('website-ld', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Portfolio Blog',
      url: buildUrl('/blog'),
      potentialAction: {
        '@type': 'SearchAction',
        target: buildUrl('/blog') + '?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    });
  }, []);

  return (
    <div className={styles.page}>
      <Section
        title="Blog"
        subtitle="Technical articles on software engineering, system design, and infrastructure."
        background="alt"
      >
        <Container>
          <div className={styles.intro}>
            <p>
              Thoughts, experiments, and lessons learned from building systems
              at scale.
            </p>
          </div>
        </Container>
      </Section>

      <Container>
        <BlogList />
      </Container>
    </div>
  );
}

export default Blog;
