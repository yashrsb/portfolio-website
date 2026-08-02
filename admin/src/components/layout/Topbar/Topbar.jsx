import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import Button from '../../common/Button/Button';
import styles from './Topbar.module.css';

/**
 * Topbar — sticky header with mobile menu, theme toggle, and logout.
 *
 * @param {Object} props
 * @param {() => void} props.onMenuClick - Opens the mobile sidebar
 * @param {string} [props.pageTitle=''] - Current page title
 */
function Topbar({ onMenuClick, pageTitle = '' }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <span aria-hidden="true">☰</span>
        </button>
        <h1 className={styles.pageTitle}>{pageTitle}</h1>
      </div>

      <div className={styles.right}>
        <button
          type="button"
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={
            theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
          }
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <div className={styles.user}>
          <span className={styles.avatar} aria-hidden="true">
            {user?.name?.charAt(0) || 'A'}
          </span>
          <span className={styles.userName}>{user?.name}</span>
        </div>

        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}

export default Topbar;
