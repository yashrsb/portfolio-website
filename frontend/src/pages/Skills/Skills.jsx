import { useEffect } from 'react';
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

const categories = [
  { key: 'languages', label: 'Languages' },
  { key: 'frontend', label: 'Frontend' },
  { key: 'backend', label: 'Backend' },
  { key: 'databases', label: 'Databases' },
  { key: 'cloud', label: 'Cloud' },
  { key: 'tools', label: 'Tools' },
];

/**
 * Skills page — grouped by category with proficiency badges.
 * Each category card fades in when it enters the viewport.
 */
function Skills() {
  const { skills, loading, error } = useSkills();

  useEffect(() => {
    setPageSEO({
      title: 'Skills',
      description:
        'Technical skills and tools I work with, categorized by proficiency.',
      path: '/skills',
    });
  }, []);

  if (loading) {
    return <LoadingState label="Loading skills..." />;
  }

  if (error) {
    return <ErrorState title="Failed to load skills" message={error} />;
  }

  return (
    <Container size="md">
      <Heading level={1} alignment="center">
        Skills
      </Heading>

      <div className={styles.grid}>
        {categories.map(({ key, label }, index) => {
          const items = skills[key] || [];
          if (!items.length) return null;

          return (
            <Reveal key={key} delay={(index % 3) * 100}>
              <Card className={styles.category}>
                <h3 className={styles.categoryTitle}>{label}</h3>
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
