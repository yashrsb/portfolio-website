import styles from './Select.module.css';

/**
 * @typedef {Object} SelectOption
 * @property {string} value - Option value
 * @property {string} label - Display label
 */

/**
 * Select — styled native select element.
 *
 * @param {Object} props
 * @param {string} [props.id] - Select id
 * @param {string} [props.name] - Select name
 * @param {string} [props.value=''] - Controlled value
 * @param {(event: React.ChangeEvent<HTMLSelectElement>) => void} [props.onChange] - Change handler
 * @param {SelectOption[]} [props.options=[]] - Options to render
 * @param {string} [props.placeholder=''] - Placeholder option text
 * @param {string} [props.error=''] - Error message (adds error styling)
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.required=false] - Required state
 */
function Select({
  id,
  name,
  value = '',
  onChange,
  options = [],
  placeholder = '',
  error = '',
  disabled = false,
  required = false,
}) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`${styles.select} ${error ? styles.invalid : ''}`}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default Select;
