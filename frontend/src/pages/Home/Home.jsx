import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Container from '../../components/common/Container/Container';
import Button from '../../components/common/Button/Button';
import LoadingState from '../../components/common/LoadingState/LoadingState';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import {
  useProfile,
  useIntersectionObserver,
  usePrefersReducedMotion,
} from '../../hooks';
import { animateValue } from '../../utils';
import { setSEOMeta, setJsonLd } from '../../utils/seo';
import { buildUrl } from '../../config/seo';
import styles from './Home.module.css';

const TYPE_SPEED = 45; // ms per character
const TYPE_START_DELAY = 300; // ms before typing begins
const COUNT_DURATION = 1200; // ms for count-up animation

function StatValue({ value, start }) {
  const [display, setDisplay] = useState('0');
  const animatedRef = useRef(false);

  useEffect(() => {
    if (!start || animatedRef.current) return;
    animatedRef.current = true;

    const numeric = parseInt(value, 10);
    if (Number.isNaN(numeric)) {
      setDisplay(String(value));
      return;
    }

    const suffix = String(value).replace(String(numeric), '');
    let cancelled = false;

    const cancel = animateValue({
      start: 0,
      end: numeric,
      duration: COUNT_DURATION,
      onUpdate: (current) => {
        if (!cancelled) {
          setDisplay(`${Math.round(current)}${suffix}`);
        }
      },
    });

    return () => {
      cancelled = true;
      cancel();
    };
  }, [start, value]);

  return <span>{display}</span>;
}

function Home() {
  const { t, i18n } = useTranslation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const { profile, loading, error } = useProfile();
  const [profileImageFailed, setProfileImageFailed] = useState(false);
  const { ref: heroRef, isVisible: heroVisible } = useIntersectionObserver({
    threshold: 0.1,
  });
  const { ref: statsRef, isVisible: statsVisible } = useIntersectionObserver({
    threshold: 0.3,
  });

  const headline = profile?.headline || '';
  const [typedText, setTypedText] = useState(
    prefersReducedMotion ? headline : '',
  );
  const [showCursor, setShowCursor] = useState(!prefersReducedMotion);

  useEffect(() => {
    if (profile?.name) {
      setSEOMeta({
        title: profile.name,
        description: profile.tagline || '',
        canonicalUrl: buildUrl('/'),
        ogTitle: profile.name,
        ogDescription: profile.tagline || '',
        ogType: 'website',
      });

      const socialLinks = {};
      if (profile.contact) {
        if (profile.contact.github) socialLinks.github = profile.contact.github;
        if (profile.contact.linkedin)
          socialLinks.linkedin = profile.contact.linkedin;
      }

      const sameAs = Object.values(socialLinks).filter(Boolean);

      setJsonLd('person-ld', {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: profile.name,
        url: buildUrl('/'),
        ...(profile.headline && { jobTitle: profile.headline }),
        ...(profile.tagline && { description: profile.tagline }),
        ...(sameAs.length > 0 && { sameAs }),
        ...(profile.profileImageUrl && { image: profile.profileImageUrl }),
      });

      setJsonLd('website-ld', {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Portfolio',
        url: buildUrl('/'),
        potentialAction: {
          '@type': 'SearchAction',
          target: buildUrl('/') + '/#q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      });
    }
  }, [profile, i18n.language]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setTypedText(headline);
      setShowCursor(false);
      return;
    }

    setTypedText('');
    setShowCursor(true);
    let charIndex = 0;
    let typeTimer;
    let cursorTimer;

    const startDelay = setTimeout(() => {
      typeTimer = setInterval(() => {
        charIndex += 1;
        setTypedText(headline.slice(0, charIndex));
        if (charIndex >= headline.length) {
          clearInterval(typeTimer);
          cursorTimer = setTimeout(() => setShowCursor(false), 1500);
        }
      }, TYPE_SPEED);
    }, TYPE_START_DELAY);

    return () => {
      clearTimeout(startDelay);
      clearInterval(typeTimer);
      clearTimeout(cursorTimer);
    };
  }, [headline, prefersReducedMotion]);

  if (loading) {
    return <LoadingState label={t('home.loadingProfile')} />;
  }

  if (error) {
    return <ErrorState title={t('home.failedToLoadProfile')} message={error} />;
  }

  if (!profile) {
    return null;
  }

  const scrollToNext = () => {
    const nextSection = document.getElementById('quick-stats');
    if (nextSection) {
      nextSection.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    }
  };

  const stats = [
    { value: profile.stats.experience, label: t('home.stats.yearsExperience') },
    { value: profile.stats.projects, label: t('home.stats.projects') },
    { value: profile.stats.technologies, label: t('home.stats.technologies') },
    {
      value: profile.stats.openSourceContributions,
      label: t('home.stats.openSourceContributions'),
    },
  ];

  return (
    <>
      <section className={styles.hero} ref={heroRef}>
        <Container>
          <div
            className={`${styles.heroGrid} ${
              heroVisible ? styles.heroVisible : styles.heroHidden
            }`}
          >
            <div className={styles.heroContent}>
              <p className={styles.greeting}>{t('home.greeting')}</p>
              <h1 className={styles.name}>{profile.name}</h1>
              <p className={styles.headline}>
                {typedText}
                {showCursor && (
                  <span className={styles.cursor} aria-hidden="true">
                    |
                  </span>
                )}
              </p>
              <p className={styles.tagline}>{profile.tagline}</p>
              <div className={styles.cta}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => window.open(profile.resumeUrl, '_blank')}
                  ariaLabel={t('home.downloadResumeLabel')}
                >
                  {t('home.downloadResume')}
                </Button>
                <Link to="/projects">
                  <Button variant="outline" size="lg">
                    {t('home.viewProjects')}
                  </Button>
                </Link>
              </div>
            </div>
            <div className={styles.heroImage}>
              {profile.profileImageUrl && !profileImageFailed ? (
                <img
                  src={profile.profileImageUrl}
                  alt={t('home.portraitAlt', { name: profile.name })}
                  className={styles.profileImage}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  width="320"
                  height="320"
                  style={{ aspectRatio: '1/1' }}
                  onError={() => setProfileImageFailed(true)}
                />
              ) : (
                <div
                  className={styles.imagePlaceholder}
                  role="img"
                  aria-label={t('home.profilePhotoPlaceholder')}
                >
                  <span className={styles.imageEmoji} aria-hidden="true">
                    👨‍💻
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            className={styles.scrollIndicator}
            onClick={scrollToNext}
            aria-label={t('home.scrollDown')}
          >
            <span className={styles.scrollText}>{t('home.scroll')}</span>
            <span className={styles.scrollArrow} aria-hidden="true">
              ↓
            </span>
          </button>
        </Container>
      </section>

      <section className={styles.statsSection} id="quick-stats">
        <Container>
          <div
            className={`${styles.stats} ${
              statsVisible ? styles.statsVisible : styles.statsHidden
            }`}
            ref={statsRef}
          >
            {stats.map((stat) => (
              <div className={styles.statItem} key={stat.label}>
                <span className={styles.statValue}>
                  <StatValue value={stat.value} start={statsVisible} />
                </span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

export default Home;
