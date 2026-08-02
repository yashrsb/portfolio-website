import { useEffect } from 'react';
import Container from '../../components/common/Container/Container';
import Section from '../../components/common/Section/Section';
import Heading from '../../components/common/Heading/Heading';
import Reveal from '../../components/common/Reveal/Reveal';
import { profile } from '../../data';
import styles from './About.module.css';

/**
 * About page — biography, strengths, interests, and career goals.
 * Each section fades in when it enters the viewport.
 */
function About() {
  useEffect(() => {
    document.title = `${profile.name} — About`;
  }, []);

  const bioParagraphs = profile.bio.split('\n');

  return (
    <Container size="md">
      <Heading level={1} alignment="center">
        About Me
      </Heading>

      <Reveal>
        <Section title="Biography">
          {bioParagraphs.map((paragraph, index) => (
            <p key={index} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}
        </Section>
      </Reveal>

      <Reveal>
        <Section title="Career Summary" background="alt">
          <p className={styles.summary}>{profile.tagline}</p>
        </Section>
      </Reveal>

      <Reveal>
        <Section title="Core Strengths">
          <ul className={styles.list}>
            {profile.strengths.map((strength) => (
              <li key={strength} className={styles.listItem}>
                {strength}
              </li>
            ))}
          </ul>
        </Section>
      </Reveal>

      <Reveal>
        <Section title="Personal Interests" background="alt">
          <ul className={styles.list}>
            {profile.interests.map((interest) => (
              <li key={interest} className={styles.listItem}>
                {interest}
              </li>
            ))}
          </ul>
        </Section>
      </Reveal>

      <Reveal>
        <Section title="Career Goals">
          <ul className={styles.list}>
            {profile.goals.map((goal) => (
              <li key={goal} className={styles.listItem}>
                {goal}
              </li>
            ))}
          </ul>
        </Section>
      </Reveal>
    </Container>
  );
}

export default About;
