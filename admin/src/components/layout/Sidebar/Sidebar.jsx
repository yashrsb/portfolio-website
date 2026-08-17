import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊', end: true },
  { to: '/projects', label: 'Projects', icon: '📁' },
  {
    to: '/blog',
    label: 'Blog',
    icon: '✍️',
    children: [
      { to: '/blog', label: 'Posts' },
      { to: '/blog/categories', label: 'Categories' },
      { to: '/blog/tags', label: 'Tags' },
    ],
  },
  { to: '/experience', label: 'Experience', icon: '💼' },
  { to: '/skills', label: 'Skills', icon: '🧠' },
  { to: '/education', label: 'Education', icon: '🎓' },
  { to: '/social-links', label: 'Social Links', icon: '🔗' },
  { to: '/contact-messages', label: 'Contact Messages', icon: '✉️' },
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
  const [expandedItem, setExpandedItem] = useState(null);

  const isBlogActive = (item) => {
    if (!item.children) return false;
    return item.children.some((child) => window.location.pathname === child.to);
  };

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
          {NAV_ITEMS.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isActive = window.location.pathname === item.to;
            const isChildActive = isBlogActive(item);
            const isExpanded = expandedItem === item.to;

            if (!hasChildren) {
              return (
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
              );
            }

            return (
              <li key={item.to}>
                <button
                  type="button"
                  className={[
                    styles.navLink,
                    isActive || isChildActive || isExpanded
                      ? styles.active
                      : '',
                    styles.hasChildren,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setExpandedItem(isExpanded ? null : item.to)}
                  aria-expanded={isExpanded}
                >
                  <span className={styles.icon} aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  <span
                    className={
                      isExpanded ? styles.chevronDown : styles.chevronRight
                    }
                    aria-hidden="true"
                  >
                    ▸
                  </span>
                </button>

                {isExpanded && (
                  <ul className={styles.childNavList}>
                    {item.children.map((child) => (
                      <li key={child.to}>
                        <NavLink
                          to={child.to}
                          end
                          className={({ isActive }) =>
                            isActive
                              ? `${styles.childNavLink} ${styles.active}`
                              : styles.childNavLink
                          }
                          onClick={onClose}
                        >
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
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
