import { useEffect } from 'react';
import Container from '../../components/common/Container/Container';
import Heading from '../../components/common/Heading/Heading';
import ProjectCard from '../../components/project/ProjectCard/ProjectCard';
import Reveal from '../../components/common/Reveal/Reveal';
import { projects } from '../../data';
import styles from './Projects.module.css';

/**
 * Projects page — grid of project cards.
 * Each card fades in when it enters the viewport (via Reveal).
 */
function Projects() {
  useEffect(() => {
    document.title = 'Projects — Alex Chen';
  }, []);

  return (
    <Container size="lg">
      <Heading level={1} alignment="center">
        Projects
      </Heading>
      <p className={styles.subtitle}>
        A selection of applications and tools I have designed and built.
      </p>

      <div className={styles.grid}>
        {projects.map((project, index) => (
          <Reveal key={project.id} delay={(index % 3) * 100}>
            <ProjectCard
              title={project.title}
              description={project.description}
              tags={project.tags}
              featured={project.featured}
              status={project.status}
              githubUrl={project.githubUrl}
              liveUrl={project.liveUrl}
              imageAlt={`${project.title} screenshot`}
            />
          </Reveal>
        ))}
      </div>
    </Container>
  );
}

export default Projects;
