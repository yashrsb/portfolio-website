import styles from './LineChart.module.css';

/**
 * LineChart — lightweight SVG-based line chart for time-series data.
 * Renders a simple area+line chart with responsive sizing.
 * Uses CSS custom properties for dark-mode support.
 * No external charting library dependency.
 *
 * @param {Object} props
 * @param {Array<{date: string, value: number}>} props.data - Data points.
 * @param {string} [props.valueKey='value'] - Key for the metric value.
 * @param {string} [props.dateKey='date'] - Key for the date label.
 * @param {string} [props.stroke='var(--color-primary)'] - SVG stroke color.
 * @param {string} [props.fill='var(--color-primary-light)'] - Area fill color.
 */
function LineChart({
  data,
  valueKey = 'value',
  dateKey = 'date',
  stroke = 'var(--color-primary)',
  fill = 'var(--color-primary-light)',
}) {
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No data available for this period.</p>
      </div>
    );
  }

  const values = safeData.map((d) => Number(d[valueKey]) || 0);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);

  const width = 100;
  const height = 4;
  const padding = 0.3;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const getX = (i) =>
    padding + (i / Math.max(safeData.length - 1, 1)) * chartWidth;
  const getY = (val) =>
    padding +
    chartHeight -
    ((val - minValue) / Math.max(maxValue - minValue, 1)) * chartHeight;

  const points = safeData
    .map((d, i) => `${getX(i)},${getY(Number(d[valueKey]) || 0)}`)
    .join(' ');

  const areaPoints = `${padding},${
    padding + chartHeight
  } ${points} ${width - padding},${padding + chartHeight}`;

  return (
    <div className={styles.wrapper}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Time series chart"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lineChartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fill} stopOpacity={0.3} />
            <stop offset="100%" stopColor={fill} stopOpacity={0} />
          </linearGradient>
        </defs>

        <polygon
          className={styles.area}
          points={areaPoints}
          fill="url(#lineChartFill)"
        />

        <polyline
          className={styles.line}
          points={points}
          fill="none"
          stroke={stroke}
          strokeWidth={0.1}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {safeData.map((d, i) => (
          <circle
            key={i}
            cx={getX(i)}
            cy={getY(Number(d[valueKey]) || 0)}
            r={0.08}
            fill={stroke}
          />
        ))}
      </svg>

      <div className={styles.labels}>
        {safeData.length > 0 && (
          <>
            <span className={styles.label}>{safeData[0][dateKey]}</span>
            {safeData.length > 1 && (
              <span className={styles.label}>
                {safeData[Math.floor(safeData.length / 2)][dateKey]}
              </span>
            )}
            {safeData.length > 1 && (
              <span className={styles.label}>
                {safeData[safeData.length - 1][dateKey]}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default LineChart;
