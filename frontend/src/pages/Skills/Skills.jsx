import { useEffect } from 'react';
import Container from '../../components/common/Container/Container';
import Heading from '../../components/common/Heading/Heading';
import Card from '../../components/common/Card/Card';
import SkillBadge from '../../components/skills/SkillBadge/SkillBadge';
import Reveal from '../../components/common/Reveal/Reveal';
import { skills } from '../../data';
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
  useEffect(() => {
    document.title = 'Skills — Alex Chen';
  }, []);

  return (
    <Container size="md">
      <Heading level={1} alignment="center">
        Skills
      </Heading>

      <div className={styles.grid}>
        {categories.map(({ key, label }, index) => (
          <Reveal key={key} delay={(index % 3) * 100}>
            <Card className={styles.category}>
              <h3 className={styles.categoryTitle}>{label}</h3>
              <div className={styles.badges}>
                {skills[key].map((skill) => (
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
        ))}
      </div>
    </Container>
  );
}

export default Skills;

