import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Navbar.module.css';
import Container from '../../common/Container/Container';
import Button from '../../common/Button/Button';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import navigation from '../../../data/navigation';

/**
 * Responsive navigation bar with hamburger menu, language switcher, theme toggle, and command palette trigger.
 * Sticky positioned at the top of the viewport.
 * Uses React Router NavLink for active page highlighting.
 *
 * @param {Object} props
 * @param {'light' | 'dark'} [props.theme='light'] - Current theme (for toggle icon)
 * @param {() => void} [props.onToggleTheme] - Theme toggle callback
 * @param {() => void} [props.onOpenCommandPalette] - Command palette open callback
 */
function Navbar({ theme = 'light', onToggleTheme, onOpenCommandPalette }) {
  const { t } = useTranslation();
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

  const getLabel = (link) =>
    t(link.labelKey || link.label, { defaultValue: link.label });

  const isMac =
    typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);
  const shortcutLabel = isMac ? 'Cmd K' : 'Ctrl K';

  return (
    <nav className={navbarClass} role="navigation" aria-label={t('nav.mainNavigation')}>
      <Container>
        <div className={styles.inner}>
          <Link to="/" className={styles.logo} aria-label={t('nav.goToHome')}>
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
                  {getLabel(link)}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            <LanguageSwitcher className={styles.langSwitcher} />
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenCommandPalette}
              ariaLabel={`Open command palette (${shortcutLabel})`}
              className={styles.paletteTrigger}
              type="button"
            >
              <svg
                className={styles.searchIcon}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className={styles.paletteLabel}>Search</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleTheme}
              ariaLabel={t(theme === 'light' ? 'nav.switchToDark' : 'nav.switchToLight')}
              type="button"
            >
              {theme === 'light' ? '\u{1F319}' : '\u{2600}\u{FE0F}'}
            </Button>
            <button
              type="button"
              className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
              onClick={toggleMenu}
              aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
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
        <div className={styles.mobileActions}>
          <LanguageSwitcher className={styles.mobileLangSwitcher} />
        </div>
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
                {getLabel(link)}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
