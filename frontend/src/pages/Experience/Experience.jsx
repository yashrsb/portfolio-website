import { useEffect } from 'react';
import Container from '../../components/common/Container/Container';
import Heading from '../../components/common/Heading/Heading';
import Card from '../../components/common/Card/Card';
import Tag from '../../components/common/Tag/Tag';
import Timeline from '../../components/timeline/Timeline/Timeline';
import Reveal from '../../components/common/Reveal/Reveal';
import LoadingState from '../../components/common/LoadingState/LoadingState';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import { useExperience } from '../../hooks';
import styles from './Experience.module.css';

/**
 * Experience page — timeline and detailed role cards.
 * Cards fade in when they enter the viewport.
 */
function Experience() {
  const { experience, loading, error } = useExperience();

  useEffect(() => {
    document.title = 'Experience — Portfolio';
  }, []);

  if (loading) {
    return <LoadingState label="Loading experience..." />;
  }

  if (error) {
    return <ErrorState title="Failed to load experience" message={error} />;
  }

  const timelineEvents = experience.map((item) => ({
    company: item.company,
    role: item.role,
    date: item.date,
    description: item.description,
  }));

  return (
    <Container size="md">
      <Heading level={1} alignment="center">
        Work Experience
      </Heading>

      <Reveal>
        <div className={styles.timelineWrap}>
          <Timeline events={timelineEvents} />
        </div>
      </Reveal>

      <div className={styles.cards}>
        {experience.map((item, index) => (
          <Reveal key={`${item.company}-${item.role}`} delay={index * 100}>
            <Card className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{item.role}</h3>
                <span className={styles.cardDate}>{item.date}</span>
              </div>
              <p className={styles.company}>{item.company}</p>
              <p className={styles.location}>{item.location}</p>
              <p className={styles.description}>{item.description}</p>

              <div className={styles.techList}>
                {item.technologies.map((tech) => (
                  <Tag key={tech} variant="primary" size="sm">
                    {tech}
                  </Tag>
                ))}
              </div>

              <h4 className={styles.subheading}>Key Responsibilities</h4>
              <ul className={styles.list}>
                {item.responsibilities.map((resp) => (
                  <li key={resp}>{resp}</li>
                ))}
              </ul>

              <h4 className={styles.subheading}>Achievements</h4>
              <ul className={styles.list}>
                {item.achievements.map((ach) => (
                  <li key={ach}>{ach}</li>
                ))}
              </ul>
            </Card>
          </Reveal>
        ))}
      </div>
    </Container>
  );
}

export default Experience;
