import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/common/Container/Container';
import Heading from '../../components/common/Heading/Heading';
import Section from '../../components/common/Section/Section';
import Reveal from '../../components/common/Reveal/Reveal';
import LoadingState from '../../components/common/LoadingState/LoadingState';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import { useProfile } from '../../hooks';
import { setPageSEO } from '../../utils/seo';
import styles from './About.module.css';

const ENGINEERING_PRINCIPLES = [
  { key: 'performance', titleKey: 'about.principles.performance.title', textKey: 'about.principles.performance.text' },
  { key: 'reliability', titleKey: 'about.principles.reliability.title', textKey: 'about.principles.reliability.text' },
  { key: 'maintainability', titleKey: 'about.principles.maintainability.title', textKey: 'about.principles.maintainability.text' },
  { key: 'simplicity', titleKey: 'about.principles.simplicity.title', textKey: 'about.principles.simplicity.text' },
  { key: 'observability', titleKey: 'about.principles.observability.title', textKey: 'about.principles.observability.text' },
  { key: 'tradeoffs', titleKey: 'about.principles.tradeoffs.title', textKey: 'about.principles.tradeoffs.text' },
];

const STRENGTH_DESCRIPTION_KEYS = {
  'Scalable Backend Development': 'about.strengthDescriptions.scalableBackend',
  'Distributed Systems': 'about.strengthDescriptions.distributedSystems',
  'Microservices Architecture': 'about.strengthDescriptions.microservices',
  'API Design (REST, GraphQL, gRPC)': 'about.strengthDescriptions.apiDesign',
  'Database Performance Optimization': 'about.strengthDescriptions.databaseOptimization',
  'System Design': 'about.strengthDescriptions.systemDesign',
};

function About() {
  const { t, i18n } = useTranslation();
  const { profile, loading, error } = useProfile();

  useEffect(() => {
    setPageSEO({
      title: t('about.title'),
      description: profile?.tagline || '',
      path: '/about',
    });
  }, [profile, t, i18n.language]);

  if (loading) {
    return <LoadingState label={t('about.loadingProfile')} />;
  }

  if (error) {
    return <ErrorState title={t('about.failedToLoadProfile')} message={error} />;
  }

  if (!profile) {
    return null;
  }

  const bioParagraphs = profile.bio.split('\n').filter((p) => p.trim());
  const tagline = profile.tagline?.trim();

  return (
    <Container size="lg">
      <Heading level={1} alignment="center" id="about-heading">
        {t('about.title')}
      </Heading>
      {tagline && <p className={styles.tagline}>{tagline}</p>}
      <div className={styles.introBody}>
        {bioParagraphs.map((paragraph, index) => (
          <p key={index} className={styles.paragraph}>
            {paragraph}
          </p>
        ))}
      </div>

      <Reveal>
        <Section
          title={t('about.coreStrengths')}
          subtitle={t('about.coreStrengthsSubtitle')}
        >
          <ul className={styles.strengthGrid}>
            {profile.strengths.map((strength, index) => (
              <li key={strength}>
                <Reveal delay={Math.min(index * 60, 300)}>
                  <div className={styles.strengthCard}>
                    <div className={styles.strengthContent}>
                      <span className={styles.strengthMarker} aria-hidden="true" />
                      <span className={styles.strengthTitle}>{strength}</span>
                    </div>
                    {STRENGTH_DESCRIPTION_KEYS[strength] && (
                      <p className={styles.strengthDescription}>
                        {t(STRENGTH_DESCRIPTION_KEYS[strength])}
                      </p>
                    )}
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>
      </Reveal>

      <Reveal>
        <Section
          title={t('about.engineeringPrinciples')}
          subtitle={t('about.engineeringPrinciplesSubtitle')}
          background="alt"
        >
          <ul className={styles.principleGrid}>
            {ENGINEERING_PRINCIPLES.map((principle) => (
              <li key={principle.key} className={styles.principleCard}>
                <h3 className={styles.principleTitle}>{t(principle.titleKey)}</h3>
                <p className={styles.principleText}>{t(principle.textKey)}</p>
              </li>
            ))}
          </ul>
        </Section>
      </Reveal>

      <Reveal>
        <Section
          title={t('about.beyondCode')}
          subtitle={t('about.beyondCodeSubtitle')}
        >
          <p className={styles.interestsIntro}>{t('about.interestsIntro')}</p>
          <ul className={styles.chipList}>
            {profile.interests.map((interest) => (
              <li key={interest} className={styles.chip}>
                {interest}
              </li>
            ))}
          </ul>
        </Section>
      </Reveal>

      <Reveal>
        <Section
          title={t('about.whereHeading')}
          subtitle={t('about.whereHeadingSubtitle')}
          background="alt"
        >
          <ol className={styles.goalList}>
            {profile.goals.map((goal, index) => (
              <li key={goal} className={styles.goalItem}>
                <span className={styles.goalNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className={styles.goalText}>{goal}</span>
              </li>
            ))}
          </ol>
          <p className={styles.closing}>{t('about.closing')}</p>
        </Section>
      </Reveal>
    </Container>
  );
}

export default About;
