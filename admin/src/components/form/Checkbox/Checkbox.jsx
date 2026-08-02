import styles from './Checkbox.module.css';

/**
 * Checkbox — accessible native checkbox with a visible label.
 *
 * @param {Object} props
 * @param {string} [props.id] - Checkbox id
 * @param {string} [props.name] - Checkbox name
 * @param {boolean} [props.checked=false] - Controlled checked state
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} [props.onChange] - Change handler
 * @param {string} [props.label=''] - Visible label text
 * @param {boolean} [props.disabled=false] - Disabled state
 */
function Checkbox({
  id,
  name,
  checked = false,
  onChange,
  label = '',
  disabled = false,
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
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}

export default Checkbox;
