import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/layout/Breadcrumb/Breadcrumb';
import SkeletonCard from '../../components/common/SkeletonCard/SkeletonCard';
import ApiErrorBanner from '../../components/common/errors/ApiErrorBanner/ApiErrorBanner';
import { dashboardService } from '../../services';
import { normalizeApiError } from '../../utils/apiErrors';
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
 * DashboardPage — overview cards, recent updates, and quick actions,
 * all backed by the real dashboard stats endpoint.
 */
function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const statItems = stats
    ? [
        {
          label: 'Projects',
          value: stats.projects,
          icon: '📁',
          to: '/projects',
        },
        { label: 'Skills', value: stats.skills, icon: '🧠', to: '/skills' },
        {
          label: 'Experience',
          value: stats.experience,
          icon: '💼',
          to: '/experience',
        },
        {
          label: 'Education',
          value: stats.education,
          icon: '🎓',
          to: '/education',
        },
        {
          label: 'Certificates',
          value: stats.certificates,
          icon: '🏅',
          to: '/education',
        },
        {
          label: 'Achievements',
          value: stats.achievements,
          icon: '⭐',
          to: '/education',
        },
        {
          label: 'Social Links',
          value: stats.socialLinks,
          icon: '🔗',
          to: '/social-links',
        },
        {
          label: 'Messages',
          value: stats.messages,
          icon: '✉️',
          to: '/contact-messages',
        },
      ]
    : [];

  return (
    <div className={styles.page}>
      <Breadcrumb items={[{ label: 'Dashboard' }]} />

      <div className={styles.header}>
        <h2 className={styles.heading}>Overview</h2>
      </div>

      {error && (
        <ApiErrorBanner
          error={error}
          onRetry={() => {
            if (error.isNetworkError) {
              loadStats();
            } else {
              setError(null);
            }
          }}
        />
      )}

      {loading ? (
        <div className={styles.statsGrid}>
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : (
        <div className={styles.statsGrid}>
          {statItems.map((item) => (
            <StatCard key={item.to + item.label} {...item} />
          ))}
        </div>
      )}

      <div className={styles.grid}>
        <section className={styles.panel} aria-labelledby="recent-heading">
          <h3 className={styles.panelTitle} id="recent-heading">
            Recent Updates
          </h3>
          {loading ? (
            <SkeletonCard />
          ) : stats?.recentProjects?.length ? (
            <ul className={styles.recentList}>
              {stats.recentProjects.map((project) => (
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
          ) : (
            <p className={styles.recentMeta}>No recent activity yet.</p>
          )}
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
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;
