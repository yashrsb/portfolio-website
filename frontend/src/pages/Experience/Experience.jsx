import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/common/Container/Container';
import Heading from '../../components/common/Heading/Heading';
import Card from '../../components/common/Card/Card';
import Tag from '../../components/common/Tag/Tag';
import Timeline from '../../components/timeline/Timeline/Timeline';
import Reveal from '../../components/common/Reveal/Reveal';
import LoadingState from '../../components/common/LoadingState/LoadingState';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import CompanyLink from '../../components/common/CompanyLink/CompanyLink';
import { useExperience } from '../../hooks';
import { setPageSEO } from '../../utils/seo';
import styles from './Experience.module.css';

function Experience() {
  const { t, i18n } = useTranslation();
  const { experience, loading, error } = useExperience();

  useEffect(() => {
    setPageSEO({
      title: t('experience.title'),
      description: t('experience.seoDescription'),
      path: '/experience',
    });
  }, [t, i18n.language]);

  if (loading) {
    return <LoadingState label={t('experience.loading')} />;
  }

  if (error) {
    return <ErrorState title={t('experience.failed')} message={error} />;
  }

  const timelineEvents = experience.map((item) => ({
    company: item.company,
    companyUrl: item.companyWebsite,
    role: item.role,
    date: item.date,
    description: item.description,
  }));

  return (
    <Container size="md">
      <Heading level={1} alignment="center">
        {t('experience.title')}
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
              <p className={styles.company}>
                <CompanyLink
                  company={item.company}
                  companyUrl={item.companyWebsite}
                />
              </p>
              <p className={styles.location}>{item.location}</p>
              <p className={styles.description}>{item.description}</p>

              <div className={styles.techList}>
                {item.technologies.map((tech) => (
                  <Tag key={tech} variant="primary" size="sm">
                    {tech}
                  </Tag>
                ))}
              </div>

              <h4 className={styles.subheading}>{t('experience.keyResponsibilities')}</h4>
              <ul className={styles.list}>
                {item.responsibilities.map((resp) => (
                  <li key={resp}>{resp}</li>
                ))}
              </ul>

              <h4 className={styles.subheading}>{t('experience.achievements')}</h4>
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
