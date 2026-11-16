import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/common/Container/Container';
import Heading from '../../components/common/Heading/Heading';
import ProjectCard from '../../components/project/ProjectCard/ProjectCard';
import Reveal from '../../components/common/Reveal/Reveal';
import LoadingState from '../../components/common/LoadingState/LoadingState';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import { useProjects } from '../../hooks';
import { setPageSEO } from '../../utils/seo';
import styles from './Projects.module.css';

function Projects() {
  const { t, i18n } = useTranslation();
  const { projects, loading, error } = useProjects();

  useEffect(() => {
    setPageSEO({
      title: t('projects.title'),
      description: t('projects.seoDescription'),
      path: '/projects',
    });
  }, [t, i18n.language]);

  if (loading) {
    return <LoadingState label={t('projects.loading')} />;
  }

  if (error) {
    return <ErrorState title={t('projects.failed')} message={error} />;
  }

  return (
    <Container size="lg">
      <Heading level={1} alignment="center">
        {t('projects.title')}
      </Heading>
      <p className={styles.subtitle}>{t('projects.subtitle')}</p>

      <div className={styles.grid}>
        {projects.map((project, index) => (
          <Reveal key={project.id} delay={(index % 3) * 100}>
            <ProjectCard
              title={project.title}
              description={project.description}
              tags={project.tags}
              slug={project.slug}
              featured={project.featured}
              status={project.status}
              githubUrl={project.githubUrl}
              liveUrl={project.demoUrl}
              imageUrl={project.imageUrl}
              imageAlt={`${project.title} screenshot`}
            />
          </Reveal>
        ))}
      </div>
    </Container>
  );
}

export default Projects;
