import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

/**
 * Accessible Modal component built on a portal.
 * - Closes on Escape and on backdrop click
 * - Locks body scroll while open
 * - Restores focus to the trigger element on close
 * - Uses a dialog role with an accessible label
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls visibility
 * @param {() => void} props.onClose - Called when the modal should close
 * @param {string} [props.title=''] - Accessible dialog title
 * @param {React.ReactNode} [props.children] - Modal content
 * @param {string} [props.size='md'] - Modal width preset: sm | md | lg
 * @param {string} [props.testId] - Optional data-testid
 */
function Modal({ isOpen, onClose, title = '', children, size = 'md', testId }) {
  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    previouslyFocusedRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    const dialog = dialogRef.current;
    if (dialog) {
      dialog.focus();
    }

    return () => {
      document.body.style.overflow = '';
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={styles.backdrop}
      data-testid={testId}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={`${styles.modal} ${styles[size]}`}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
