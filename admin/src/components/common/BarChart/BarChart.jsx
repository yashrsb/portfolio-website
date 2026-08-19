import styles from './BarChart.module.css';

/**
 * BarChart — lightweight, CSS-based horizontal bar chart.
 * Uses CSS custom properties for dark-mode support.
 * No external charting library dependency.
 *
 * @param {Object} props
 * @param {Array<{label: string, value: number}>} props.data - Bar data.
 * @param {string} [props.valueKey='value'] - Key for the bar value.
 * @param {string} [props.labelKey='label'] - Key for the bar label.
 * @param {string} [props.color='--color-primary'] - CSS color variable for bars.
 * @param {number} [props.maxBarWidth='100%'] - Maximum width of the bars container.
 * @param {boolean} [props.showValues=true] - Whether to display numeric values.
 */
function BarChart({
  data,
  valueKey = 'value',
  labelKey = 'label',
  color = 'var(--color-primary)',
  maxBarWidth = '100%',
  showValues = true,
}) {
  const safeData = Array.isArray(data) ? data : [];
  const maxValue = Math.max(...safeData.map((d) => Number(d[valueKey]) || 0), 1);

  if (safeData.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No data available for this chart.</p>
      </div>
    );
  }

  return (
    <div className={styles.chart} role="img" aria-label="Bar chart">
      {safeData.map((item, index) => {
        const value = Number(item[valueKey]) || 0;
        const percentage = Math.round((value / maxValue) * 100);
        const label = item[labelKey];

        return (
          <div
            key={item.id || label || index}
            className={styles.row}
          >
            <div
              className={styles.bar}
              style={{
                width: `${percentage}%`,
                maxWidth: maxBarWidth,
                backgroundColor: color,
              }}
            >
              {showValues && (
                <span className={styles.barValue}>{value}</span>
              )}
            </div>
            <span className={styles.barLabel} title={label}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default BarChart;
