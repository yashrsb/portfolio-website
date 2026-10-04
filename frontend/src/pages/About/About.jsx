import { useEffect } from 'react';
import Container from '../../components/common/Container/Container';
import Heading from '../../components/common/Heading/Heading';
import Section from '../../components/common/Section/Section';
import Reveal from '../../components/common/Reveal/Reveal';
import LoadingState from '../../components/common/LoadingState/LoadingState';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import { useProfile } from '../../hooks';
import { setPageSEO } from '../../utils/seo';
import styles from './About.module.css';

/**
 * Engineering principles — static copy describing approach,
 * not tied to any database field.
 */
const ENGINEERING_PRINCIPLES = [
  {
    title: 'Performance',
    text: "Don't accept slow systems as inevitable. Find where the bottleneck actually is before optimizing.",
  },
  {
    title: 'Reliability',
    text: 'Design for failure, observability, and recoverability — behavior should be predictable in production.',
  },
  {
    title: 'Maintainability',
    text: 'Code should still be understandable months after it was written, by me or by someone else.',
  },
  {
    title: 'Simplicity',
    text: 'Prefer the simplest architecture that genuinely meets the requirements — and no more.',
  },
  {
    title: 'Observability',
    text: 'A production system should tell you what is happening when something goes wrong.',
  },
  {
    title: 'Trade-offs',
    text: 'Every engineering decision has trade-offs. Choose deliberately based on the problem, constraints, and long-term impact.',
  },
];

/**
 * Frontend-only mapping of strength names to richer descriptions.
 * Derived from existing profile.strengths array — no schema change needed.
 * Kept in the component to avoid hardcoding in the database.
 */
const STRENGTH_DESCRIPTIONS = {
  'Scalable Backend Development':
    'Building maintainable backend services and APIs designed for scale.',
  'Distributed Systems':
    'Working with service-to-service communication, asynchronous workflows, and distributed architectures.',
  'Microservices Architecture':
    'Decomposing domains into independently deployable services with clear boundaries.',
  'API Design (REST, GraphQL, gRPC)':
    'Designing interfaces that are reliable, versionable, and developer-friendly.',
  'Database Performance Optimization':
    'Optimizing queries, indexes, data access patterns, and database-heavy workloads.',
  'System Design':
    'Thinking about scalability, failure modes, service boundaries, and long-term maintainability.',
};

/**
 * About page — personal story, strengths, engineering principles,
 * interests, and career direction. All profile content comes from
 * the existing profile API.
 */
function About() {
  const { profile, loading, error } = useProfile();

  useEffect(() => {
    if (profile) {
      setPageSEO({
        title: 'About',
        description: profile.tagline || '',
        path: '/about',
      });
    }
  }, [profile]);

  if (loading) {
    return <LoadingState label="Loading profile..." />;
  }

  if (error) {
    return <ErrorState title="Failed to load profile" message={error} />;
  }

  if (!profile) {
    return null;
  }

  const bioParagraphs = profile.bio.split('\n').filter((p) => p.trim());
  const tagline = profile.tagline?.trim();

  return (
    <Container size="lg">
      {/* ---- Introduction ---- */}
      <Heading level={1} alignment="center" id="about-heading">
        About
      </Heading>
      {tagline && (
        <p className={styles.tagline}>
          {tagline}
        </p>
      )}
      <div className={styles.introBody}>
        {bioParagraphs.map((paragraph, index) => (
          <p key={index} className={styles.paragraph}>
            {paragraph}
          </p>
        ))}
      </div>

      {/* ---- Core Strengths ---- */}
      <Reveal>
        <Section
          title="Core Strengths"
          subtitle="What I build and where I focus."
        >
          <ul className={styles.strengthGrid}>
            {profile.strengths.map((strength, index) => (
              <li key={strength}>
                <Reveal delay={Math.min(index * 60, 300)}>
                  <div className={styles.strengthCard}>
                    <div className={styles.strengthContent}>
                      <span
                        className={styles.strengthMarker}
                        aria-hidden="true"
                      />
                      <span className={styles.strengthTitle}>{strength}</span>
                    </div>
                    {STRENGTH_DESCRIPTIONS[strength] && (
                      <p className={styles.strengthDescription}>
                        {STRENGTH_DESCRIPTIONS[strength]}
                      </p>
                    )}
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>
      </Reveal>

      {/* ---- Engineering Principles ---- */}
      <Reveal>
        <Section
          title="How I Think About Engineering"
          subtitle="The principles I try to apply to the work."
          background="alt"
        >
          <ul className={styles.principleGrid}>
            {ENGINEERING_PRINCIPLES.map((principle) => (
              <li key={principle.title} className={styles.principleCard}>
                <h3 className={styles.principleTitle}>{principle.title}</h3>
                <p className={styles.principleText}>{principle.text}</p>
              </li>
            ))}
          </ul>
        </Section>
      </Reveal>

      {/* ---- Interests ---- */}
      <Reveal>
        <Section
          title="Beyond the Code"
          subtitle="What keeps me curious outside day-to-day work."
        >
          <p className={styles.interestsIntro}>
            I&apos;m naturally curious about how things work and tend to keep
            learning even outside the immediate requirements of a project.
          </p>
          <ul className={styles.chipList}>
            {profile.interests.map((interest) => (
              <li key={interest} className={styles.chip}>
                {interest}
              </li>
            ))}
          </ul>
        </Section>
      </Reveal>

      {/* ---- Career Goals ---- */}
      <Reveal>
        <Section
          title="Where I'm Heading"
          subtitle="The direction I'm growing toward."
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
          <p className={styles.closing}>
            I&apos;m still learning, still experimenting, and still looking for
            better ways to build software.
          </p>
        </Section>
      </Reveal>
    </Container>
  );
}

export default About;
