import styles from './TextArea.module.css';

/**
 * TextArea — styled multi-line text input.
 *
 * @param {Object} props
 * @param {string} [props.id] - Textarea id
 * @param {string} [props.name] - Textarea name
 * @param {string} [props.value=''] - Controlled value
 * @param {(event: React.ChangeEvent<HTMLTextAreaElement>) => void} [props.onChange] - Change handler
 * @param {string} [props.placeholder=''] - Placeholder text
 * @param {string} [props.error=''] - Error message (adds error styling)
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.required=false] - Required state
 * @param {number} [props.rows=4] - Visible rows
 */
function TextArea({
  id,
  name,
  value = '',
  onChange,
  placeholder = '',
  error = '',
  disabled = false,
  required = false,
  rows = 4,
}) {
  return (
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      rows={rows}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`${styles.textarea} ${error ? styles.invalid : ''}`}
    />
  );
}

export default TextArea;
