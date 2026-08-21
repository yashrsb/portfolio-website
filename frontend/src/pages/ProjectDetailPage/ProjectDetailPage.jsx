import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Container from '../../components/common/Container/Container';
import Heading from '../../components/common/Heading/Heading';
import Tag from '../../components/common/Tag/Tag';
import Button from '../../components/common/Button/Button';
import Card from '../../components/common/Card/Card';
import Section from '../../components/common/Section/Section';
import Reveal from '../../components/common/Reveal/Reveal';
import LoadingState from '../../components/common/LoadingState/LoadingState';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import { useProject } from '../../hooks';
import { usePrefersReducedMotion } from '../../hooks';
import {
  trackProjectView,
  trackProjectClick,
} from '../../services/analyticsService';
import { setSEOMeta, removeJsonLd, setJsonLd } from '../../utils/seo';
import { buildUrl } from '../../config/seo';
import styles from './ProjectDetailPage.module.css';

const STATUS_LABEL = {
  live: 'Live',
  wip: 'In Progress',
  archived: 'Archived',
};

const STATUS_VARIANT = {
  live: 'success',
  wip: 'warning',
  archived: 'danger',
};

/**
 * Renders a list of string items as a responsive card grid.
 * @param {string[]} items
 * @param {string} titleLabel - aria-label for the list.
 */
function FeatureList({ items, titleLabel }) {
  if (!items.length) return null;
  return (
    <ul className={styles.featureList} aria-label={titleLabel}>
      {items.map((item, index) => (
        <Reveal key={index} as="li" delay={index * 50}>
          <Card shadow="sm" padding="md" className={styles.featureCard}>
            <p className={styles.featureText}>{item}</p>
          </Card>
        </Reveal>
      ))}
    </ul>
  );
}

/**
 * Renders the tech stack as grouped tag clusters.
 * @param {object} techStack - { Frontend: [...], Backend: [...] }
 */
function TechStackDisplay({ techStack }) {
  if (!techStack || typeof techStack !== 'object') return null;
  return (
    <div className={styles.techStack}>
      {Object.entries(techStack).map(([category, technologies]) => {
        if (!Array.isArray(technologies) || technologies.length === 0)
          return null;
        return (
          <div key={category} className={styles.techCategory}>
            <h4 className={styles.techCategoryTitle}>{category}</h4>
            <div className={styles.techTags}>
              {technologies.map((tech) => (
                <Tag key={tech} variant="default" size="md">
                  {tech}
                </Tag>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Accessible screenshot gallery with a lightbox modal.
 * @param {{ src: string, alt: string, caption?: string }[]} screenshots
 */
function ScreenshotGallery({ screenshots }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const prefersReduced = usePrefersReducedMotion();
  const safeScreenshots = Array.isArray(screenshots) ? screenshots : [];

  const openLightbox = (index) => setActiveIndex(index);
  const closeLightbox = useCallback(() => setActiveIndex(null), []);

  const handleKeyDown = useCallback(
    (event) => {
      if (activeIndex === null) return;
      switch (event.key) {
        case 'Escape':
          setActiveIndex(null);
          break;
        case 'ArrowLeft':
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : safeScreenshots.length - 1,
          );
          break;
        case 'ArrowRight':
          setActiveIndex((prev) =>
            prev < safeScreenshots.length - 1 ? prev + 1 : 0,
          );
          break;
        default:
          break;
      }
    },
    [activeIndex, safeScreenshots.length],
  );

  useEffect(() => {
    if (activeIndex !== null && !prefersReduced && safeScreenshots.length > 0) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
    return undefined;
  }, [activeIndex, prefersReduced, safeScreenshots.length]);

  useEffect(() => {
    if (activeIndex === null) return undefined;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, handleKeyDown]);

  if (!safeScreenshots.length) return null;

  return (
    <>
      <ul className={styles.gallery}>
        {safeScreenshots.map((screenshot, index) => (
          <li key={index} className={styles.galleryItem}>
            <button
              type="button"
              className={styles.galleryButton}
              onClick={() => openLightbox(index)}
              aria-label={`View ${screenshot.alt || screenshot.caption || 'screenshot'} enlarged`}
            >
              <img
                src={screenshot.src}
                alt=""
                className={styles.galleryImage}
                loading="lazy"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openLightbox(index);
                }}
              />
              {screenshot.caption && (
                <figcaption className={styles.galleryCaption}>
                  {screenshot.caption}
                </figcaption>
              )}
            </button>
          </li>
        ))}
      </ul>

      {activeIndex !== null && (
        <div
          className={styles.lightboxOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Screenshot preview"
          onClick={closeLightbox}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={closeLightbox}
            aria-label="Close preview"
          >
            &times;
          </button>
          <button
            type="button"
            className={`${styles.lightboxNav} ${styles.lightboxNavPrev}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((prev) =>
                prev > 0 ? prev - 1 : safeScreenshots.length - 1,
              );
            }}
            aria-label="Previous screenshot"
          >
            ‹
          </button>
          <img
            src={safeScreenshots[activeIndex].src}
            alt={safeScreenshots[activeIndex].alt || ''}
            className={styles.lightboxImage}
            onClick={(e) => e.stopPropagation()}
          />
          {safeScreenshots[activeIndex].caption && (
            <figcaption
              className={styles.lightboxCaption}
              onClick={(e) => e.stopPropagation()}
            >
              {safeScreenshots[activeIndex].caption}
            </figcaption>
          )}
          <button
            type="button"
            className={`${styles.lightboxNav} ${styles.lightboxNavNext}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((prev) =>
                prev < safeScreenshots.length - 1 ? prev + 1 : 0,
              );
            }}
            aria-label="Next screenshot"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}

/**
 * Reusable, data-driven project detail page.
 * Renders every project based on its slug; only sections with content
 * are displayed.
 */
function ProjectDetailPage() {
  const { slug } = useParams();
  const { project, loading, error, notFound } = useProject(slug);

  useEffect(() => {
    if (project) {
      // Track project view (non-blocking, fire-and-forget)
      trackProjectView(project.slug, window.location.pathname);

      const projectUrl = buildUrl(`/projects/${project.slug}`);

      setSEOMeta({
        title: project.title,
        description: project.summary || project.description,
        canonicalUrl: projectUrl,
        ogTitle: project.title,
        ogDescription: project.summary || project.description,
        ogType: 'website',
        ogImage: project.imageUrl || '',
        ogImageAlt: project.title,
        twitterCard: project.imageUrl ? 'summary_large_image' : 'summary',
        twitterTitle: project.title,
        twitterDescription: project.summary || project.description,
        twitterImage: project.imageUrl || '',
        author: undefined,
      });

      // SoftwareApplication JSON-LD for the project
      setJsonLd('project-ld', {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: project.title,
        description: project.summary || project.description,
        ...(projectUrl && { url: projectUrl }),
        ...(project.imageUrl && { image: project.imageUrl }),
        ...(project.tags &&
          project.tags.length > 0 && {
            applicationCategory: project.tags.join(', '),
          }),
        ...(project.techStack && {
          operatingSystem: Object.keys(project.techStack).join(', '),
        }),
      });

      // BreadcrumbList JSON-LD
      setJsonLd('breadcrumb-ld', {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Projects',
            item: buildUrl('/projects'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: project.title,
            item: projectUrl,
          },
        ],
      });
    } else {
      // Reset SEO for 404 state
      removeJsonLd('project-ld');
      removeJsonLd('breadcrumb-ld');
      setSEOMeta({
        title: 'Project Not Found',
        description:
          'The project you are looking for does not exist or has been removed.',
        canonicalUrl: buildUrl('/projects'),
        robots: 'noindex, nofollow',
      });
    }
  }, [project, slug]);

  if (loading) {
    return <LoadingState label="Loading project details..." />;
  }

  if (notFound) {
    return (
      <Container size="sm">
        <Reveal>
          <div className={styles.notFound}>
            <p className={styles.notFoundCode}>404</p>
            <Heading level={1} alignment="center">
              Project Not Found
            </Heading>
            <p className={styles.notFoundText}>
              The project you are looking for does not exist or has been
              removed.
            </p>
            <Link to="/projects">
              <Button variant="primary" size="lg">
                Back to Projects
              </Button>
            </Link>
          </div>
        </Reveal>
      </Container>
    );
  }

  if (error) {
    return <ErrorState title="Failed to load project" message={error} />;
  }

  if (!project) return null;

  const hasFeatures =
    Array.isArray(project.features) && project.features.length > 0;
  const hasTechStack =
    project.techStack && typeof project.techStack === 'object';
  const hasScreenshots =
    Array.isArray(project.screenshots) && project.screenshots.length > 0;
  const hasArchitecture = Boolean(project.architecture);
  const hasArchitectureImage = Boolean(project.architectureImage);
  const hasChallenges =
    Array.isArray(project.challenges) && project.challenges.length > 0;
  const hasLessons =
    Array.isArray(project.lessonsLearned) && project.lessonsLearned.length > 0;
  const hasTags = Array.isArray(project.tags) && project.tags.length > 0;

  return (
    <article className={styles.page}>
      {/* Hero */}
      <Section className={styles.hero}>
        <Container size="lg">
          <Reveal>
            <div className={styles.heroGrid}>
              <div className={styles.heroContent}>
                <Heading level={1}>{project.title}</Heading>
                {project.summary && (
                  <p className={styles.summary}>{project.summary}</p>
                )}
                <div className={styles.heroMeta}>
                  {project.status && (
                    <Tag variant={STATUS_VARIANT[project.status]} size="sm">
                      {STATUS_LABEL[project.status]}
                    </Tag>
                  )}
                  {project.featured && (
                    <Tag variant="primary" size="sm">
                      Featured
                    </Tag>
                  )}
                </div>

                {/* CTAs */}
                <div className={styles.ctas}>
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.githubLink}
                      onClick={() =>
                        trackProjectClick(
                          project.slug,
                          'github',
                          window.location.pathname,
                        )
                      }
                    >
                      <Button variant="primary" size="md">
                        View GitHub Repository
                      </Button>
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackProjectClick(
                          project.slug,
                          'demo',
                          window.location.pathname,
                        )
                      }
                    >
                      <Button variant="outline" size="md">
                        Live Demo
                      </Button>
                    </a>
                  )}
                </div>

                {/* Tech stack preview */}
                {hasTechStack && (
                  <div className={styles.techPreview}>
                    <TechStackDisplay techStack={project.techStack} />
                  </div>
                )}
              </div>

              {project.imageUrl && (
                <div className={styles.heroImage}>
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className={styles.heroImageImg}
                    loading="lazy"
                    width="600"
                    height="400"
                  />
                </div>
              )}
            </div>
          </Reveal>
        </Container>
      </Section>

      <Container size="lg">
        {/* Tags */}
        {hasTags && (
          <Reveal>
            <div className={styles.tagsSection}>
              <h2 className={styles.sectionLabel}>Technologies</h2>
              <div className={styles.tags}>
                {project.tags.map((tag) => (
                  <Tag key={tag} variant="default" size="md">
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* Overview */}
        <Reveal>
          <Section title="Overview" subtitle={project.summary || undefined}>
            <p className={styles.description}>{project.description}</p>
          </Section>
        </Reveal>

        {/* Features */}
        {hasFeatures && (
          <Reveal>
            <Section title="Key Features">
              <FeatureList items={project.features} titleLabel="Key features" />
            </Section>
          </Reveal>
        )}

        {/* Architecture */}
        {(hasArchitecture || hasArchitectureImage) && (
          <Reveal>
            <Section title="Architecture">
              {hasArchitectureImage && (
                <div className={styles.architectureImage}>
                  <img
                    src={project.architectureImage}
                    alt={`Architecture diagram for ${project.title}`}
                    loading="lazy"
                  />
                </div>
              )}
              {hasArchitecture && (
                <p className={styles.architectureText}>
                  {project.architecture}
                </p>
              )}
            </Section>
          </Reveal>
        )}

        {/* Screenshots */}
        {hasScreenshots && (
          <Reveal>
            <Section title="Screenshots">
              <ScreenshotGallery screenshots={project.screenshots} />
            </Section>
          </Reveal>
        )}

        {/* Tech Stack */}
        {hasTechStack && (
          <Reveal>
            <Section title="Tech Stack">
              <TechStackDisplay techStack={project.techStack} />
            </Section>
          </Reveal>
        )}

        {/* Challenges */}
        {hasChallenges && (
          <Reveal>
            <Section title="Challenges">
              <FeatureList
                items={project.challenges}
                titleLabel="Engineering challenges"
              />
            </Section>
          </Reveal>
        )}

        {/* Lessons Learned */}
        {hasLessons && (
          <Reveal>
            <Section title="Lessons Learned">
              <FeatureList
                items={project.lessonsLearned}
                titleLabel="Lessons learned"
              />
            </Section>
          </Reveal>
        )}

        {/* GitHub CTA */}
        {(project.githubUrl || project.demoUrl) && (
          <Reveal>
            <div className={styles.footerCta}>
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary" size="md">
                    View on GitHub
                  </Button>
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="md">
                    Live Demo
                  </Button>
                </a>
              )}
            </div>
          </Reveal>
        )}
      </Container>
    </article>
  );
}

export default ProjectDetailPage;
