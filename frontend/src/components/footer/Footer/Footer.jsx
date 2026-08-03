import { useIntersectionObserver, useSocial } from '../../../hooks';
import styles from './Footer.module.css';
import Container from '../../common/Container/Container';
import Button from '../../common/Button/Button';

const PLATFORM_ICONS = {
  github: '🐙',
  linkedin: '🔗',
  twitter: '🐦',
  leetcode: '👨‍💻',
  email: '✉️',
};

const PLATFORM_LABELS = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  twitter: 'Twitter',
  leetcode: 'LeetCode',
  email: 'Email',
};

/**
 * Resolves a display label for a social platform.
 * @param {string} platform - Platform key.
 * @returns {string} Human-readable label.
 */
const getLabel = (platform) =>
  PLATFORM_LABELS[platform] || platform.charAt(0).toUpperCase() + platform.slice(1);

/**
 * Site footer with social links, copyright, and a back-to-top button.
 * Social links are loaded from the API.
 */
function Footer() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
  const { socialLinks } = useSocial();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  const footerClasses = [styles.footer, isVisible ? styles.footerVisible : '']
    .filter(Boolean)
    .join(' ');

  return (
    <footer ref={ref} className={footerClasses}>
      <Container>
        <div className={styles.inner}>
          {/* Social links */}
          <div className={styles.socials}>
            {socialLinks.map((link) => {
              const label = getLabel(link.platform);
              const icon = link.icon || PLATFORM_ICONS[link.platform] || '🔗';
              return (
                <a
                  key={link.platform}
                  href={link.url}
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  <span className={styles.socialIcon} aria-hidden="true">
                    {icon}
                  </span>
                  <span className={styles.socialLabel}>{label}</span>
                </a>
              );
            })}
          </div>

          {/* Copyright */}
          <p className={styles.copyright}>
            &copy; {currentYear} Portfolio. All rights reserved.
          </p>

          {/* Back to top */}
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollToTop}
            ariaLabel="Back to top"
          >
            ↑ Back to Top
          </Button>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
