import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/layout/Breadcrumb/Breadcrumb';
import Button from '../../components/common/Button/Button';
import {
  projects,
  skills,
  experience,
  education,
  socialLinks,
  contactMessages,
} from '../../data/mockData';
import styles from './DashboardPage.module.css';

/**
 * StatCard — small overview metric card.
 *
 * @param {Object} props
 * @param {string} props.label - Metric label
 * @param {number} props.value - Metric value
 * @param {string} props.icon - Icon label
 * @param {string} props.to - Route link target
 */
function StatCard({ label, value, icon, to }) {
  return (
    <Link to={to} className={styles.statCard}>
      <span className={styles.statIcon} aria-hidden="true">
        {icon}
      </span>
      <div className={styles.statInfo}>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statLabel}>{label}</span>
      </div>
    </Link>
  );
}

const QUICK_ACTIONS = [
  { to: '/projects', label: 'Add Project', icon: '📁' },
  { to: '/skills', label: 'Add Skill', icon: '🧠' },
  { to: '/experience', label: 'Add Experience', icon: '💼' },
  { to: '/resume', label: 'Update Resume', icon: '📄' },
];

/**
 * DashboardPage — overview cards, recent updates, and quick actions.
 */
function DashboardPage() {
  const recentUpdates = [...projects]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div className={styles.page}>
      <Breadcrumb items={[{ label: 'Dashboard' }]} />

      <div className={styles.header}>
        <h2 className={styles.heading}>Overview</h2>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          label="Projects"
          value={projects.length}
          icon="📁"
          to="/projects"
        />
        <StatCard label="Skills" value={skills.length} icon="🧠" to="/skills" />
        <StatCard
          label="Experience"
          value={experience.length}
          icon="💼"
          to="/experience"
        />
        <StatCard
          label="Education"
          value={education.length}
          icon="🎓"
          to="/education"
        />
        <StatCard
          label="Social Links"
          value={socialLinks.length}
          icon="🔗"
          to="/social-links"
        />
        <StatCard
          label="Messages"
          value={contactMessages.length}
          icon="✉️"
          to="/settings"
        />
      </div>

      <div className={styles.grid}>
        <section className={styles.panel} aria-labelledby="recent-heading">
          <h3 className={styles.panelTitle} id="recent-heading">
            Recent Updates
          </h3>
          <ul className={styles.recentList}>
            {recentUpdates.map((project) => (
              <li key={project.id} className={styles.recentItem}>
                <span className={styles.recentDot} aria-hidden="true" />
                <div className={styles.recentInfo}>
                  <span className={styles.recentTitle}>{project.title}</span>
                  <span className={styles.recentMeta}>
                    {project.status} · updated {formatDate(project.updatedAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.panel} aria-labelledby="actions-heading">
          <h3 className={styles.panelTitle} id="actions-heading">
            Quick Actions
          </h3>
          <div className={styles.quickActions}>
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.to + action.label}
                to={action.to}
                className={styles.quickAction}
              >
                <span aria-hidden="true">{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>
          <div className={styles.actionsFooter}>
            <Button variant="outline" size="sm">
              View all activity
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;
