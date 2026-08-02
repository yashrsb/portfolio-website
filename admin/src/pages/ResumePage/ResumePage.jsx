import Breadcrumb from '../../components/layout/Breadcrumb/Breadcrumb';
import Button from '../../components/common/Button/Button';
import { useToast } from '../../context/ToastContext';
import styles from './ResumePage.module.css';

/**
 * ResumePage — resume management placeholder.
 *
 * Upload, replace, and delete are UI-only for Phase 7.
 * Real file uploads arrive in a future phase.
 */
function ResumePage() {
  const { showToast } = useToast();

  const handleUpload = () => {
    showToast('info', 'Resume upload is coming in a future phase.');
  };

  const handleReplace = () => {
    showToast('info', 'Resume replace is coming in a future phase.');
  };

  const handleDelete = () => {
    showToast('info', 'Resume delete is coming in a future phase.');
  };

  return (
    <div className={styles.page}>
      <Breadcrumb items={[{ label: 'Resume' }]} />

      <div className={styles.header}>
        <h2 className={styles.heading}>Resume</h2>
      </div>

      <div className={styles.card}>
        <div className={styles.fileIcon} aria-hidden="true">
          📄
        </div>
        <h3 className={styles.fileName}>alex-chen-resume.pdf</h3>
        <p className={styles.fileMeta}>PDF · 245 KB · Updated Jan 2026</p>

        <div className={styles.actions}>
          <Button onClick={handleUpload}>Upload New</Button>
          <Button variant="outline" onClick={handleReplace}>
            Replace
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <div className={styles.placeholderNote}>
        <p>
          Upload and storage features will be enabled in a future phase. This
          page currently demonstrates the management UI only.
        </p>
      </div>
    </div>
  );
}

export default ResumePage;
