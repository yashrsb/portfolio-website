import Container from '../../components/common/Container/Container';
import Section from '../../components/common/Section/Section';
import BlogList from '../../components/blog/BlogList/BlogList';
import styles from './Blog.module.css';

function Blog() {
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
