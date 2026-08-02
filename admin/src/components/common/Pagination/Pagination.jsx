import styles from './Pagination.module.css';

/**
 * Pagination — UI-only pagination control.
 *
 * NOTE: Pagination logic is intentionally not implemented in Phase 7.
 * These buttons are visual affordances for the future API integration.
 *
 * @param {Object} props
 * @param {number} [props.currentPage=1] - Active page (display only)
 * @param {number} [props.totalPages=1] - Total page count (display only)
 */
function Pagination({ currentPage = 1, totalPages = 1 }) {
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  const pageItems = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        type="button"
        className={styles.button}
        disabled={isFirst}
        aria-label="Go to previous page"
      >
        &laquo; Prev
      </button>

      <ul className={styles.pages}>
        {pageItems.map((page) => (
          <li key={page}>
            <button
              type="button"
              className={`${styles.pageButton} ${
                page === currentPage ? styles.active : ''
              }`}
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={styles.button}
        disabled={isLast}
        aria-label="Go to next page"
      >
        Next &raquo;
      </button>
    </nav>
  );
}

export default Pagination;
