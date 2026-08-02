import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊', end: true },
  { to: '/projects', label: 'Projects', icon: '📁' },
  { to: '/experience', label: 'Experience', icon: '💼' },
  { to: '/skills', label: 'Skills', icon: '🧠' },
  { to: '/education', label: 'Education', icon: '🎓' },
  { to: '/social-links', label: 'Social Links', icon: '🔗' },
  { to: '/resume', label: 'Resume', icon: '📄' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

/**
 * Sidebar — responsive navigation rail for the admin app.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the mobile sidebar is visible
 * @param {() => void} props.onClose - Called when a nav link is clicked (mobile)
 */
function Sidebar({ isOpen, onClose }) {
  return (
    <aside
      className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}
      aria-label="Admin navigation"
    >
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">
          ◈
        </span>
        <span className={styles.brandText}>Portfolio Admin</span>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navLink} ${styles.active}`
                    : styles.navLink
                }
                onClick={onClose}
              >
                <span className={styles.icon} aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.footer}>
        <a
          className={styles.viewSiteLink}
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Public Site →
        </a>
      </div>
    </aside>
  );
}

export default Sidebar;
