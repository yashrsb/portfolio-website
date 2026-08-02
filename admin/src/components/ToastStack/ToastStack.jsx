import { useToast } from '../../context/ToastContext';
import styles from './ToastStack.module.css';

/**
 * ToastStack — renders active toasts with type-based styling.
 */
function ToastStack() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className={styles.stack} aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]}`}
          role="status"
        >
          <span className={styles.message}>{toast.message}</span>
          <button
            type="button"
            className={styles.close}
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastStack;
