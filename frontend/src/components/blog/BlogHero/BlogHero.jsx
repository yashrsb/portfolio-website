import { useTranslation } from 'react-i18next';
import Reveal from '../../common/Reveal/Reveal';
import styles from './BlogHero.module.css';

function BlogHero({ eyebrow, headline, description } = {}) {
  const { t } = useTranslation();
  const eyebrowText = eyebrow ?? t('blog.hero.eyebrow');
  const descriptionText = description ?? t('blog.hero.description');
  const headlineText =
    headline ??
    [
      t('blog.hero.headline1'),
      t('blog.hero.headline2'),
      t('blog.hero.headline3'),
    ].join('\n');
  const headlineLines = headlineText.split('\n');

  return (
    <section className={styles.hero} aria-labelledby="blog-hero-title">
      <div className={styles.inner}>
        <Reveal>
          <span className={styles.eyebrow} aria-hidden="true">
            {eyebrowText}
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
          <p className={styles.description}>{descriptionText}</p>
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