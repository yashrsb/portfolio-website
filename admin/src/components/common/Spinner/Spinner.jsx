import styles from './Spinner.module.css';

/**
 * Spinner — small inline circular loader for buttons and inline actions.
 *
 * @param {Object} props
 * @param {'sm' | 'md'} [props.size='sm'] - Size preset
 * @param {string} [props.label='Loading'] - Accessible label
 */
function Spinner({ size = 'sm', label = 'Loading' }) {
  return (
    <span
      className={`${styles.spinner} ${styles[size]}`}
      role="status"
      aria-label={label}
    />
  );
}

export default Spinner;
