import styles from './Toggle.module.css';

/**
 * Toggle — accessible switch control.
 *
 * @param {Object} props
 * @param {string} [props.id] - Toggle id
 * @param {string} [props.name] - Toggle name
 * @param {boolean} [props.checked=false] - Controlled checked state
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} [props.onChange] - Change handler
 * @param {string} [props.label=''] - Visible label text
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {string} [props.onText='On'] - Accessible on label
 * @param {string} [props.offText='Off'] - Accessible off label
 */
function Toggle({
  id,
  name,
  checked = false,
  onChange,
  label = '',
  disabled = false,
  onText = 'On',
  offText = 'Off',
}) {
  return (
    <label className={`${styles.wrapper} ${disabled ? styles.disabled : ''}`}>
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={styles.input}
      />
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
      <span className={styles.label}>
        {label || (checked ? onText : offText)}
      </span>
    </label>
  );
}

export default Toggle;
