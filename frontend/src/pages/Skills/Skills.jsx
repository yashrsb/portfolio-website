import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/common/Container/Container';
import Heading from '../../components/common/Heading/Heading';
import Card from '../../components/common/Card/Card';
import SkillBadge from '../../components/skills/SkillBadge/SkillBadge';
import Reveal from '../../components/common/Reveal/Reveal';
import LoadingState from '../../components/common/LoadingState/LoadingState';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import { useSkills } from '../../hooks';
import { setPageSEO } from '../../utils/seo';
import styles from './Skills.module.css';

const CATEGORIES = [
  { key: 'languages', labelKey: 'skills.categories.languages' },
  { key: 'frontend', labelKey: 'skills.categories.frontend' },
  { key: 'backend', labelKey: 'skills.categories.backend' },
  { key: 'databases', labelKey: 'skills.categories.databases' },
  { key: 'cloud', labelKey: 'skills.categories.cloud' },
  { key: 'tools', labelKey: 'skills.categories.tools' },
];

function Skills() {
  const { t, i18n } = useTranslation();
  const { skills, loading, error } = useSkills();

  useEffect(() => {
    setPageSEO({
      title: t('skills.title'),
      description: t('skills.seoDescription'),
      path: '/skills',
    });
  }, [t, i18n.language]);

  if (loading) {
    return <LoadingState label={t('skills.loading')} />;
  }

  if (error) {
    return <ErrorState title={t('skills.failed')} message={error} />;
  }

  return (
    <Container size="md">
      <Heading level={1} alignment="center">
        {t('skills.title')}
      </Heading>

      <div className={styles.grid}>
        {CATEGORIES.map(({ key, labelKey }, index) => {
          const items = skills[key] || [];
          if (!items.length) return null;

          return (
            <Reveal key={key} delay={(index % 3) * 100}>
              <Card className={styles.category}>
                <h3 className={styles.categoryTitle}>{t(labelKey)}</h3>
                <div className={styles.badges}>
                  {items.map((skill) => (
                    <SkillBadge
                      key={skill.name}
                      name={skill.name}
                      icon={skill.icon}
                      proficiency={skill.proficiency}
                    />
                  ))}
                </div>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </Container>
  );
}

export default Skills;
