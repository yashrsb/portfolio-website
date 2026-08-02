import { Link } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

/**
 * @typedef {Object} BreadcrumbItem
 * @property {string} label - Display label
 * @property {string} [to] - Optional route link
 */

/**
 * Breadcrumb — navigation trail for the current location.
 *
 * @param {Object} props
 * @param {BreadcrumbItem[]} props.items - Breadcrumb items (last is current)
 */
function Breadcrumb({ items = [] }) {
  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className={styles.item}>
              {item.to && !isLast ? (
                <Link className={styles.link} to={item.to}>
                  {item.label}
                </Link>
              ) : (
                <span
                  className={styles.current}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className={styles.separator} aria-hidden="true">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
