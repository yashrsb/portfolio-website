import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import styles from './ConfirmDialog.module.css';

/**
 * ConfirmDialog — reusable destructive-action confirmation.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls visibility
 * @param {() => void} props.onClose - Cancel handler
 * @param {() => void} props.onConfirm - Confirm handler
 * @param {string} [props.title='Are you sure?'] - Dialog title
 * @param {string} [props.message=''] - Confirmation message
 * @param {string} [props.confirmLabel='Delete'] - Confirm button label
 * @param {string} [props.cancelLabel='Cancel'] - Cancel button label
 */
function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <Button variant="outline" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
