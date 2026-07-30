import { useState } from 'react';
import styles from './Navbar.module.css';
import Container from '../../common/Container/Container';
import Button from '../../common/Button/Button';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
];

/**
 * Responsive navigation bar with hamburger menu and dark mode toggle placeholder.
 * Sticky positioned at the top of the viewport.
 *
 * @param {Object} props
 * @param {'light' | 'dark'} [props.theme='light'] - Current theme (for toggle icon)
 * @param {() => void} [props.onToggleTheme] - Theme toggle callback
 */
function Navbar({ theme = 'light', onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={styles.navbar} role="navigation" aria-label="Main navigation">
      <Container>
        <div className={styles.inner}>
          {/* Logo / Name */}
          <a href="#home" className={styles.logo} aria-label="Go to home">
            Portfolio
          </a>

          {/* Desktop links */}
          <ul className={styles.desktopLinks}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={styles.link}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Actions (theme toggle + hamburger) */}
          <div className={styles.actions}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleTheme}
              ariaLabel={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </Button>

            <button
              type="button"
              className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
              onClick={toggleMenu}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span className={styles.bar} />
              <span className={styles.bar} />
              <span className={styles.bar} />
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile menu */}
      <div
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}
        aria-hidden={!menuOpen}
      >
        <ul className={styles.mobileLinks}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={styles.mobileLink}
                onClick={closeMenu}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
