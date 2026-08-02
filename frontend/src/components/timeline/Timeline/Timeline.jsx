import { useIntersectionObserver } from '../../../hooks';
import styles from './Timeline.module.css';

/**
 * @typedef {Object} TimelineEvent
 * @property {string} company - Company or institution name
 * @property {string} role - Job title or role
 * @property {string} date - Date range (e.g., "Jan 2020 — Present")
 * @property {string} [description] - Optional description of responsibilities
 */

/**
 * Reusable timeline component that renders an array of events.
 * Items fade and slide upward when they enter the viewport.
 *
 * @param {Object} props
 * @param {TimelineEvent[]} props.events - Array of timeline events
 * @param {string} [props.className] - Additional CSS classes
 */
function Timeline({ events = [], className = '' }) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  if (!events.length) {
    return null;
  }

  const classNames = [styles.timeline, className].filter(Boolean).join(' ');

  return (
    <div ref={ref} className={classNames} role="list" aria-label="Timeline">
      {events.map((event, index) => (
        <div
          key={`${event.company}-${index}`}
          className={`${styles.item} ${
            isVisible ? styles.itemVisible : styles.itemHidden
          }`}
          style={{ transitionDelay: `${index * 80}ms` }}
          role="listitem"
        >
          <div className={styles.marker}>
            <div className={styles.dot} aria-hidden="true" />
            {index < events.length - 1 && (
              <div className={styles.line} aria-hidden="true" />
            )}
          </div>
          <div className={styles.content}>
            <div className={styles.header}>
              <h3 className={styles.role}>{event.role}</h3>
              <span className={styles.date}>{event.date}</span>
            </div>
            <p className={styles.company}>{event.company}</p>
            {event.description && (
              <p className={styles.description}>{event.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Timeline;
