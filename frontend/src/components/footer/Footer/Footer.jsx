import { useIntersectionObserver } from '../../../hooks';
import styles from './Footer.module.css';
import Container from '../../common/Container/Container';
import Button from '../../common/Button/Button';

const SOCIAL_LINKS = [
  { label: 'GitHub', href: '#', icon: '🐙' },
  { label: 'LinkedIn', href: '#', icon: '🔗' },
  { label: 'Twitter', href: '#', icon: '🐦' },
  { label: 'Email', href: '#', icon: '✉️' },
];

/**
 * Site footer with social links, copyright, and a back-to-top button.
 * Gently fades in when it enters the viewport.
 */
function Footer() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

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
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
              >
                <span className={styles.socialIcon} aria-hidden="true">
                  {link.icon}
                </span>
                <span className={styles.socialLabel}>{link.label}</span>
              </a>
            ))}
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
