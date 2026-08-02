import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import styles from './Navbar.module.css';
import Container from '../../common/Container/Container';
import Button from '../../common/Button/Button';
import navigation from '../../../data/navigation';

/**
 * Responsive navigation bar with hamburger menu and dark mode toggle.
 * Sticky positioned at the top of the viewport.
 * Uses React Router NavLink for active page highlighting.
 *
 * @param {Object} props
 * @param {'light' | 'dark'} [props.theme='light'] - Current theme (for toggle icon)
 * @param {() => void} [props.onToggleTheme] - Theme toggle callback
 */
function Navbar({ theme = 'light', onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const navbarClass = [styles.navbar, scrolled ? styles.navbarScrolled : '']
    .filter(Boolean)
    .join(' ');

  return (
    <nav className={navbarClass} role="navigation" aria-label="Main navigation">
      <Container>
        <div className={styles.inner}>
          <Link to="/" className={styles.logo} aria-label="Go to home">
            Portfolio
          </Link>
          <ul className={styles.desktopLinks}>
            {navigation.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `${styles.link} ${isActive ? styles.linkActive : ''}`
                  }
                  end={link.path === '/'}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleTheme}
              ariaLabel={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '\u{1F319}' : '\u{2600}\u{FE0F}'}
            </Button>
            <button
              type="button"
              className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
              onClick={toggleMenu}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <span className={styles.bar} />
              <span className={styles.bar} />
              <span className={styles.bar} />
            </button>
          </div>
        </div>
      </Container>
      <div
        id="mobile-menu"
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}
        aria-hidden={!menuOpen}
      >
        <ul className={styles.mobileLinks}>
          {navigation.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ''}`
                }
                onClick={closeMenu}
                end={link.path === '/'}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
