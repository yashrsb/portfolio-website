import { useEffect } from 'react';
import Container from '../../components/common/Container/Container';
import Heading from '../../components/common/Heading/Heading';
import Card from '../../components/common/Card/Card';
import Reveal from '../../components/common/Reveal/Reveal';
import LoadingState from '../../components/common/LoadingState/LoadingState';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import { useEducation } from '../../hooks';
import { setPageSEO } from '../../utils/seo';
import styles from './Education.module.css';

/**
 * Education page — degrees, certificates, and achievements.
 * Cards fade in when they enter the viewport.
 */
function Education() {
  const { education, certificates, achievements, loading, error } =
    useEducation();

  useEffect(() => {
    setPageSEO({
      title: 'Education',
      description: 'Academic background, certifications, and achievements.',
      path: '/education',
    });
  }, []);

  if (loading) {
    return <LoadingState label="Loading education..." />;
  }

  if (error) {
    return <ErrorState title="Failed to load education" message={error} />;
  }

  return (
    <Container size="md">
      <Heading level={1} alignment="center">
        Education
      </Heading>

      <h2 className={styles.sectionTitle}>Degrees</h2>
      <div className={styles.stack}>
        {education.map((edu, index) => (
          <Reveal key={`${edu.institution}-${edu.degree}`} delay={index * 100}>
            <Card>
              <h3 className={styles.institution}>{edu.institution}</h3>
              <p className={styles.degree}>{edu.degree}</p>
              <p className={styles.meta}>
                {edu.date}
                {edu.gpa ? ` • GPA ${edu.gpa}` : ''}
              </p>
              <ul className={styles.list}>
                {edu.highlights.map((hl) => (
                  <li key={hl}>{hl}</li>
                ))}
              </ul>
            </Card>
          </Reveal>
        ))}
      </div>

      <h2 className={styles.sectionTitle}>Certificates</h2>
      <div className={styles.stack}>
        {certificates.map((cert, index) => (
          <Reveal key={cert.name} delay={index * 100}>
            <Card>
              <h3 className={styles.certTitle}>{cert.name}</h3>
              <p className={styles.meta}>
                {cert.issuer} • {cert.date}
              </p>
            </Card>
          </Reveal>
        ))}
      </div>

      <h2 className={styles.sectionTitle}>Achievements</h2>
      <div className={styles.stack}>
        {achievements.map((ach, index) => (
          <Reveal key={ach.title} delay={index * 100}>
            <Card>
              <h3 className={styles.certTitle}>{ach.title}</h3>
              <p className={styles.meta}>
                {ach.organization} • {ach.year}
              </p>
              <p className={styles.description}>{ach.description}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Container>
  );
}

export default Education;
