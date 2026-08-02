import styles from './ErrorState.module.css';

/**
 * ErrorState — centered error message for async page data.
 *
 * @param {Object} props
 * @param {string} [props.title='Something went wrong'] - Error title
 * @param {string} [props.message=''] - Error message
 */
function ErrorState({ title = 'Something went wrong', message = '' }) {
  return (
    <div className={styles.wrapper} role="alert">
      <span className={styles.icon} aria-hidden="true">
        ⚠️
      </span>
      <h2 className={styles.title}>{title}</h2>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}

export default ErrorState;
