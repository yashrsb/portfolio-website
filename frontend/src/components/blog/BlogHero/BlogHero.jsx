import Reveal from '../../common/Reveal/Reveal';
import styles from './BlogHero.module.css';

/**
 * BlogHero — upper introduction for the public Blog page.
 *
 * Communicates the broader scope of the blog: engineering, systems,
 * and ideas across computer science and software engineering topics.
 *
 * This is a pure presentational component — no data fetching, no
 * search, no filtering. All behavior is preserved from the parent.
 *
 * @param {Object} props
 * @param {string} [props.eyebrow] - Small label above the headline
 * @param {string} [props.headline] - Main focal headline
 * @param {string} [props.description] - Supporting description
 */
function BlogHero({
  eyebrow = 'Engineering Notes',
  headline = 'Building systems.\nExploring ideas.\nSharing what I learn.',
  description =
    'Practical articles on backend engineering, system design, databases, cloud infrastructure, JavaScript, and other areas of computer science.',
}) {
  const headlineLines = headline.split('\n');

  return (
    <section className={styles.hero} aria-labelledby="blog-hero-title">
      <div className={styles.inner}>
        <Reveal>
          <span className={styles.eyebrow} aria-hidden="true">
            {eyebrow}
          </span>
        </Reveal>

        <Reveal delay={80}>
          <h1 id="blog-hero-title" className={styles.headline}>
            {headlineLines.map((line, index) => (
              <span key={index} className={styles.headlineLine}>
                {line}
              </span>
            ))}
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className={styles.description}>{description}</p>
        </Reveal>

        <Reveal delay={240} className={styles.decorRow} aria-hidden="true">
          <span className={styles.decorItem}>{'{ }'}</span>
          <span className={styles.decorDot} />
          <span className={styles.decorItem}>{'<>'}</span>
          <span className={styles.decorDot} />
          <span className={styles.decorItem}>{'DB'}</span>
          <span className={styles.decorDot} />
          <span className={styles.decorItem}>{'/api'}</span>
        </Reveal>
      </div>
    </section>
  );
}

export default BlogHero;