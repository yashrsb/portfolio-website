import styles from './FormField.module.css';

/**
 * FormField — wraps a form control with label, hint, and error text.
 *
 * @param {Object} props
 * @param {string} [props.label=''] - Field label
 * @param {string} [props.htmlFor] - id of the associated control
 * @param {string} [props.error=''] - Validation error message
 * @param {string} [props.hint=''] - Helper text below the control
 * @param {boolean} [props.required=false] - Shows a required asterisk
 * @param {React.ReactNode} [props.children] - The form control
 * @param {string} [props.className] - Additional wrapper classes
 */
function FormField({
  label = '',
  htmlFor,
  error = '',
  hint = '',
  required = false,
  children,
  className = '',
}) {
  return (
    <div className={`${styles.field} ${className}`}>
      {label && (
        <label className={styles.label} htmlFor={htmlFor}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      )}
      {children}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;
