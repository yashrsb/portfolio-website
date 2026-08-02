import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../../components/common/Container/Container';
import Button from '../../components/common/Button/Button';
import { profile } from '../../data';
import { useIntersectionObserver, usePrefersReducedMotion } from '../../hooks';
import { animateValue } from '../../utils';
import styles from './Home.module.css';

const TYPE_SPEED = 45; // ms per character
const TYPE_START_DELAY = 300; // ms before typing begins
const COUNT_DURATION = 1200; // ms for count-up animation

/**
 * Renders a stat value with count-up animation.
 * Non-numeric values (e.g., "8+") are rendered as-is.
 *
 * @param {Object} props
 * @param {string | number} props.value - Stat value
 * @param {boolean} props.start - Whether to start the animation
 */
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

    const suffix = String(value).replace(numeric, '');
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

/**
 * Home page — hero section with headline, CTA buttons,
 * profile image placeholder, and quick statistics.
 */
function Home() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { ref: heroRef, isVisible: heroVisible } = useIntersectionObserver({
    threshold: 0.1,
  });
  const { ref: statsRef, isVisible: statsVisible } = useIntersectionObserver({
    threshold: 0.3,
  });

  const headline = profile.headline;
  const [typedText, setTypedText] = useState(
    prefersReducedMotion ? headline : '',
  );
  const [showCursor, setShowCursor] = useState(!prefersReducedMotion);

  useEffect(() => {
    document.title = `${profile.name} — Portfolio`;
  }, []);

  // Typing animation — runs once, respects reduced motion
  useEffect(() => {
    if (prefersReducedMotion) {
      setTypedText(headline);
      setShowCursor(false);
      return;
    }

    let charIndex = 0;
    let typeTimer;
    let cursorTimer;

    const startDelay = setTimeout(() => {
      typeTimer = setInterval(() => {
        charIndex += 1;
        setTypedText(headline.slice(0, charIndex));
        if (charIndex >= headline.length) {
          clearInterval(typeTimer);
          // Stop blinking cursor after typing completes
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

  const scrollToNext = () => {
    const nextSection = document.getElementById('quick-stats');
    if (nextSection) {
      nextSection.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    }
  };

  const stats = [
    { value: profile.stats.experience, label: 'Years Experience' },
    { value: profile.stats.projects, label: 'Projects' },
    { value: profile.stats.technologies, label: 'Technologies' },
    {
      value: profile.stats.openSourceContributions,
      label: 'Open Source Contributions',
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
              <p className={styles.greeting}>Hi, I&apos;m</p>
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
                  ariaLabel="Download resume"
                >
                  Download Resume
                </Button>
                <Link to="/projects">
                  <Button variant="outline" size="lg">
                    View Projects
                  </Button>
                </Link>
              </div>
            </div>
            <div className={styles.heroImage}>
              <div
                className={styles.imagePlaceholder}
                role="img"
                aria-label="Profile photo placeholder"
              >
                <span className={styles.imageEmoji} aria-hidden="true">
                  👨‍💻
                </span>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <button
            type="button"
            className={styles.scrollIndicator}
            onClick={scrollToNext}
            aria-label="Scroll down to quick statistics"
          >
            <span className={styles.scrollText}>Scroll</span>
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
