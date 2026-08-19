import styles from './DateRangeSelector.module.css';

/**
 * Preset date range options.
 */
const DATE_RANGE_PRESETS = [
  { value: 1, label: 'Today' },
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
];

export { DATE_RANGE_PRESETS };

/**
 * DateRangeSelector — compact date range selector with presets.
 *
 * @param {Object} props
 * @param {number} props.value - Selected days value.
 * @param {function(number): void} props.onChange - Called when selection changes.
 * @param {boolean} [props.disabled=false] - Disable the selector.
 */
function DateRangeSelector({ value, onChange, disabled = false }) {
  return (
    <div className={styles.selector}>
      <label htmlFor="date-range" className={styles.label}>
        Date range
      </label>
      <select
        id="date-range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.select}
        disabled={disabled}
        aria-label="Select date range"
      >
        {DATE_RANGE_PRESETS.map((preset) => (
          <option key={preset.value} value={preset.value}>
            {preset.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default DateRangeSelector;
