import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/common/Container/Container';
import Heading from '../../components/common/Heading/Heading';
import Card from '../../components/common/Card/Card';
import Reveal from '../../components/common/Reveal/Reveal';
import LoadingState from '../../components/common/LoadingState/LoadingState';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import { useEducation } from '../../hooks';
import { setPageSEO } from '../../utils/seo';
import styles from './Education.module.css';

function Education() {
  const { t, i18n } = useTranslation();
  const { education, certificates, achievements, loading, error } =
    useEducation();

  useEffect(() => {
    setPageSEO({
      title: t('education.title'),
      description: t('education.seoDescription'),
      path: '/education',
    });
  }, [t, i18n.language]);

  if (loading) {
    return <LoadingState label={t('education.loading')} />;
  }

  if (error) {
    return <ErrorState title={t('education.failed')} message={error} />;
  }

  return (
    <Container size="md">
      <Heading level={1} alignment="center">
        {t('education.title')}
      </Heading>

      <h2 className={styles.sectionTitle}>{t('education.degrees')}</h2>
      <div className={styles.stack}>
        {education.map((edu, index) => (
          <Reveal key={`${edu.institution}-${edu.degree}`} delay={index * 100}>
            <Card>
              <h3 className={styles.institution}>{edu.institution}</h3>
              <p className={styles.degree}>{edu.degree}</p>
              <p className={styles.meta}>
                {edu.date}
                {edu.gpa ? ` • ${t('education.gpa', { gpa: edu.gpa })}` : ''}
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

      <h2 className={styles.sectionTitle}>{t('education.certificates')}</h2>
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

      <h2 className={styles.sectionTitle}>{t('education.achievements')}</h2>
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
