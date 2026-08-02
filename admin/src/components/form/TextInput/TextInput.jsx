import styles from './TextInput.module.css';

/**
 * TextInput — styled text/number/email/url input.
 *
 * @param {Object} props
 * @param {string} [props.type='text'] - Input type
 * @param {string} [props.id] - Input id
 * @param {string} [props.name] - Input name
 * @param {string} [props.value=''] - Controlled value
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} [props.onChange] - Change handler
 * @param {string} [props.placeholder=''] - Placeholder text
 * @param {string} [props.error=''] - Error message (adds error styling)
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.required=false] - Required state
 * @param {number} [props.min] - Minimum value (for number inputs)
 * @param {number} [props.max] - Maximum value (for number inputs)
 */
function TextInput({
  type = 'text',
  id,
  name,
  value = '',
  onChange,
  placeholder = '',
  error = '',
  disabled = false,
  required = false,
  min,
  max,
}) {
  return (
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      min={min}
      max={max}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`${styles.input} ${error ? styles.invalid : ''}`}
    />
  );
}

export default TextInput;
