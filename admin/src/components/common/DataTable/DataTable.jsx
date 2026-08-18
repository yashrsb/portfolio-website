import styles from './DataTable.module.css';

/**
 * @typedef {Object} Column
 * @property {string} key - Unique column key
 * @property {string} label - Header label
 * @property {'text' | 'number' | 'badge' | 'action'} [type='text'] - Cell render type
 * @property {(row: Object) => React.ReactNode} [render] - Custom cell renderer
 * @property {boolean} [sortable=false] - Whether column is sortable (UI only)
 */

/**
 * DataTable — reusable, accessible table for admin listings.
 *
 * @param {Object} props
 * @param {Column[]} props.columns - Column definitions
 * @param {Object[]} props.rows - Data rows
 * @param {string} [props.emptyMessage='No data available'] - Empty state message
 * @param {string} [props.caption=''] - Accessible table caption
 * @param {React.ReactNode} [props.toolbar] - Optional toolbar above the table
 */
function DataTable({
  columns,
  rows,
  emptyMessage = 'No data available',
  caption = '',
  toolbar,
}) {
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <div className={styles.wrapper}>
      {toolbar && <div className={styles.toolbar}>{toolbar}</div>}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          {caption && <caption className={styles.caption}>{caption}</caption>}
          <thead>
            <tr>
              {safeColumns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={styles[column.type]}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {safeRows.length === 0 ? (
              <tr>
                <td colSpan={safeColumns.length} className={styles.emptyCell}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              safeRows.map((row, rowIndex) => (
                <tr key={row.id || rowIndex}>
                  {safeColumns.map((column) => (
                    <td key={column.key} className={styles[column.type]}>
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
