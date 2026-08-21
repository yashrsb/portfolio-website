import { useEffect, useState, useCallback, useRef } from 'react';
import Breadcrumb from '../../components/layout/Breadcrumb/Breadcrumb';
import SkeletonCard from '../../components/common/SkeletonCard/SkeletonCard';
import SkeletonTable from '../../components/common/SkeletonTable/SkeletonTable';
import ApiErrorBanner from '../../components/common/errors/ApiErrorBanner/ApiErrorBanner';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import LineChart from '../../components/common/LineChart/LineChart';
import DateRangeSelector, {
  DATE_RANGE_PRESETS,
} from '../../components/common/DateRangeSelector/DateRangeSelector';
import { analyticsService } from '../../services';
import { normalizeApiError } from '../../utils/apiErrors';
import styles from './AnalyticsPage.module.css';

const DEFAULT_DAYS = 30;

/**
 * StatCard — small overview metric card with period comparison.
 *
 * @param {Object} props
 * @param {string} props.label
 * @param {number} props.value
 * @param {string} props.icon
 * @param {object} [props.previous] - Previous period data.
 * @param {number} [props.previous.value]
 */
function StatCard({ label, value, icon, previous }) {
  const hasPrevious = previous && previous.value > 0;
  let changeText = '';
  let changeClass = styles.changeNeutral;

  if (hasPrevious) {
    const change = ((value - previous.value) / previous.value) * 100;
    if (Math.abs(change) < 0.5) {
      changeText = '—';
    } else if (change >= 0) {
      changeText = `+${change.toFixed(0)}%`;
      changeClass = styles.changePositive;
    } else {
      changeText = `${change.toFixed(0)}%`;
      changeClass = styles.changeNegative;
    }
  }

  return (
    <div className={styles.statCard}>
      <div className={styles.statHeader}>
        <span className={styles.statIcon} aria-hidden="true">
          {icon}
        </span>
        <span className={styles.statLabel}>{label}</span>
      </div>
      <div className={styles.statValue}>{value}</div>
      {hasPrevious && (
        <div className={`${styles.statChange} ${changeClass}`}>
          {changeText} vs prev period
        </div>
      )}
    </div>
  );
}

/**
 * AnalyticsPage — full analytics dashboard.
 *
 * Fetches data from the admin analytics API (all aggregation happens
 * server-side in PostgreSQL). Shows overview cards, time-series chart,
 * top pages, countries, devices, browsers, projects, and referrers.
 */
function AnalyticsPage() {
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [dashboardData, setDashboardData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPromiseRef = useRef(null);

  const loadDashboard = useCallback(async () => {
    if (fetchPromiseRef.current) {
      return fetchPromiseRef.current;
    }

    setLoading(true);
    setError(null);

    const promise = (async () => {
      try {
        const data = await analyticsService.getDashboard(days);
        setDashboardData(data);
        setError(null);
        return data;
      } catch (err) {
        setError(normalizeApiError(err));
        throw err;
      } finally {
        setLoading(false);
        fetchPromiseRef.current = null;
      }
    })();

    fetchPromiseRef.current = promise;
    return promise;
  }, [days]);

  useEffect(() => {
    loadDashboard().catch(() => {});
  }, [loadDashboard]);

  const overview = dashboardData?.overview ?? null;
  const timeSeries = dashboardData?.timeseries ?? null;
  const topPages = dashboardData?.pages ?? null;
  const countries = dashboardData?.countries ?? null;
  const devices = dashboardData?.devices ?? null;
  const browsers = dashboardData?.browsers ?? null;
  const projects = dashboardData?.projects ?? null;
  const referrers = dashboardData?.referrers ?? null;

  return (
    <div className={styles.page}>
      <Breadcrumb items={[{ label: 'Analytics' }]} />

      <div className={styles.header}>
        <h2 className={styles.heading}>Analytics</h2>
        <div className={styles.toolbar}>
          <DateRangeSelector
            value={days}
            onChange={setDays}
            disabled={loading}
          />
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={() => loadDashboard()}
            disabled={loading}
            aria-label="Refresh analytics data"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && !loading && (
        <ApiErrorBanner error={error} onRetry={loadDashboard} />
      )}

      {!loading && !error && overview === null && (
        <EmptyState message="No analytics data available yet." />
      )}

      {/* Summary Cards */}
      {!loading && !error && overview && (
        <section className={styles.section} aria-labelledby="summary-heading">
          <h3 className={styles.sectionTitle} id="summary-heading">
            Summary (
            {DATE_RANGE_PRESETS.find((p) => p.value === days)?.label ||
              'Custom'}
            )
          </h3>
          <div className={styles.statsGrid}>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} lines={2} />
              ))
            ) : (
              <>
                <StatCard
                  label="Visitors"
                  value={overview.current.totalVisitors}
                  icon="👥"
                  previous={{ value: overview.previous.totalVisitors }}
                />
                <StatCard
                  label="Page Views"
                  value={overview.current.totalPageViews}
                  icon="👁️"
                  previous={{ value: overview.previous.totalPageViews }}
                />
                <StatCard
                  label="Project Views"
                  value={overview.current.totalProjectViews}
                  icon="📁"
                  previous={{ value: overview.previous.totalProjectViews }}
                />
                <StatCard
                  label="Project Clicks"
                  value={overview.current.totalProjectClicks}
                  icon="🖱️"
                  previous={{ value: overview.previous.totalProjectClicks }}
                />
                <StatCard
                  label="Blog Views"
                  value={overview.current.totalBlogViews}
                  icon="✍️"
                  previous={{ value: overview.previous.totalBlogViews }}
                />
              </>
            )}
          </div>
        </section>
      )}

      {/* Visitor Trend */}
      {!error && (
        <section className={styles.section} aria-labelledby="trend-heading">
          <h3 className={styles.sectionTitle} id="trend-heading">
            Visitor Trend
          </h3>
          <div className={styles.chartCard}>
            {loading ? (
              <SkeletonCard lines={3} />
            ) : timeSeries && timeSeries.length > 0 ? (
              <LineChart
                data={timeSeries}
                dateKey="date"
                valueKey="visitors"
                stroke="var(--color-primary)"
                fill="var(--color-primary-light)"
              />
            ) : (
              <EmptyState
                title="No visitor data yet"
                description="Analytics events will appear here once traffic is received."
                icon="📊"
              />
            )}
          </div>
        </section>
      )}

      {!error && (
        <div className={styles.contentGrid}>
          {/* Top Pages */}
          <section className={styles.section} aria-labelledby="pages-heading">
            <h3 className={styles.sectionTitle} id="pages-heading">
              Top Pages
            </h3>
            <div className={styles.tableCard}>
              {loading ? (
                <SkeletonTable rows={5} columns={3} />
              ) : topPages && topPages.length > 0 ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Page</th>
                      <th>Views</th>
                      <th>Visitors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPages.map((page) => (
                      <tr key={page.path}>
                        <td>{page.path}</td>
                        <td>{page.views}</td>
                        <td>{page.uniqueVisitors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState
                  title="No page views yet"
                  description="Page view data appears once visitors browse your site."
                  icon="👁️"
                />
              )}
            </div>
          </section>

          {/* Countries */}
          <section
            className={styles.section}
            aria-labelledby="countries-heading"
          >
            <h3 className={styles.sectionTitle} id="countries-heading">
              Countries
            </h3>
            <div className={styles.tableCard}>
              {loading ? (
                <SkeletonTable rows={5} columns={3} />
              ) : countries && countries.length > 0 ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Country</th>
                      <th>Visitors</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countries.map((c) => (
                      <tr key={c.country}>
                        <td>{c.country}</td>
                        <td>{c.visitors}</td>
                        <td>{c.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState
                  title="No country data"
                  description="Country data appears once visitors from different regions browse your site."
                  icon="🌍"
                />
              )}
            </div>
          </section>

          {/* Devices */}
          <section className={styles.section} aria-labelledby="devices-heading">
            <h3 className={styles.sectionTitle} id="devices-heading">
              Devices
            </h3>
            <div className={styles.tableCard}>
              {loading ? (
                <SkeletonTable rows={4} columns={3} />
              ) : devices && devices.length > 0 ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Device</th>
                      <th>Visitors</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((d) => (
                      <tr key={d.deviceType}>
                        <td>{d.deviceType}</td>
                        <td>{d.visitors}</td>
                        <td>{d.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState
                  title="No device data"
                  description="Device breakdown appears once visitors browse your site."
                  icon="📱"
                />
              )}
            </div>
          </section>

          {/* Browsers */}
          <section
            className={styles.section}
            aria-labelledby="browsers-heading"
          >
            <h3 className={styles.sectionTitle} id="browsers-heading">
              Browsers
            </h3>
            <div className={styles.tableCard}>
              {loading ? (
                <SkeletonTable rows={5} columns={3} />
              ) : browsers && browsers.length > 0 ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Browser</th>
                      <th>Visitors</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {browsers.map((b) => (
                      <tr key={b.browser}>
                        <td>{b.browser}</td>
                        <td>{b.visitors}</td>
                        <td>{b.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState
                  title="No browser data"
                  description="Browser breakdown appears once visitors browse your site."
                  icon="🌐"
                />
              )}
            </div>
          </section>

          {/* Most Viewed Projects */}
          <section
            className={styles.section}
            aria-labelledby="projects-heading"
          >
            <h3 className={styles.sectionTitle} id="projects-heading">
              Most Viewed Projects
            </h3>
            <div className={styles.tableCard}>
              {loading ? (
                <SkeletonTable rows={5} columns={5} />
              ) : projects && projects.length > 0 ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Views</th>
                      <th>Visitors</th>
                      <th>GitHub</th>
                      <th>Demo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => (
                      <tr key={p.slug}>
                        <td>
                          <a
                            href={`/projects/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.projectLink}
                          >
                            {p.title}
                          </a>
                        </td>
                        <td>{p.views}</td>
                        <td>{p.uniqueVisitors}</td>
                        <td>{p.githubClicks}</td>
                        <td>{p.demoClicks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState
                  title="No project views yet"
                  description="Project view data appears once visitors browse your projects."
                  icon="📁"
                />
              )}
            </div>
          </section>

          {/* Referrers */}
          <section
            className={styles.section}
            aria-labelledby="referrers-heading"
          >
            <h3 className={styles.sectionTitle} id="referrers-heading">
              Referrers
            </h3>
            <div className={styles.tableCard}>
              {loading ? (
                <SkeletonTable rows={5} columns={3} />
              ) : referrers && referrers.length > 0 ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Source</th>
                      <th>Visitors</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrers.map((r) => (
                      <tr key={r.source}>
                        <td>{r.source}</td>
                        <td>{r.visitors}</td>
                        <td>{r.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState
                  title="No referrer data"
                  description="Referrer data appears once visitors come from external sites."
                  icon="🔗"
                />
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AnalyticsPage;
