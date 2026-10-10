import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import styles from './Navbar.module.css';
import Container from '../../common/Container/Container';
import ThemeSelector from '../../theme/ThemeSelector/ThemeSelector';
import navigation from '../../../data/navigation';

/**
 * Responsive navigation bar with hamburger menu and theme selector.
 * Sticky positioned at the top of the viewport.
 * Uses React Router NavLink for active page highlighting.
 *
 * @param {Object} props
 * @param {import('../../context/ThemeContext').ThemePreference} [props.preference='system'] - Current theme preference.
 * @param {(pref: import('../../context/ThemeContext').ThemePreference) => void} [props.onPreferenceChange] - Theme preference change callback.
 * @deprecated Use `preference` and `onPreferenceChange` instead of `theme` and `onToggleTheme`.
 */
function Navbar({ preference = 'system', onPreferenceChange }) {
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
            <ThemeSelector
              preference={preference}
              onPreferenceChange={onPreferenceChange}
            />
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