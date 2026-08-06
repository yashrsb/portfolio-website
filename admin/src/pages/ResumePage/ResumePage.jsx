import { useEffect, useState, useCallback, useRef } from 'react';
import Breadcrumb from '../../components/layout/Breadcrumb/Breadcrumb';
import Button from '../../components/common/Button/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';
import ApiErrorBanner from '../../components/common/errors/ApiErrorBanner/ApiErrorBanner';
import { useToast } from '../../context/ToastContext';
import { resumeService } from '../../services';
import { normalizeApiError } from '../../utils/apiErrors';
import styles from './ResumePage.module.css';

const ACCEPTED_TYPES = ['application/pdf'];

/**
 * formatters — display helpers for resume metadata.
 */
const formatBytes = (bytes) => {
  if (!bytes) return 'Unknown size';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

/**
 * ResumePage — manage the single resume file.
 *
 * Fetches current metadata, supports upload/replace via a hidden file
 * input, and delete with confirmation. All actions call the real
 * resumeService API.
 */
function ResumePage() {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadResume = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await resumeService.getResume();
      setResume(data);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResume();
  }, [loadResume]);

  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      showToast('error', 'Only PDF files are accepted.');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const result = resume
        ? await resumeService.replaceResume(file)
        : await resumeService.uploadResume(file);
      setResume(result.resume);
      showToast('success', 'Resume uploaded successfully.');
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await resumeService.deleteResume();
      setResume(null);
      setConfirmOpen(false);
      showToast('success', 'Resume deleted successfully.');
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.page}>
      <Breadcrumb items={[{ label: 'Resume' }]} />

      <div className={styles.header}>
        <h2 className={styles.heading}>Resume</h2>
        <Button variant="outline" size="sm" onClick={loadResume}>
          Refresh
        </Button>
      </div>

      {error && (
        <ApiErrorBanner
          error={error}
          onRetry={() => {
            if (error.isNetworkError) {
              loadResume();
            } else {
              setError(null);
            }
          }}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="visually-hidden"
        onChange={handleFileSelected}
        aria-label="Upload resume file"
      />

      <div className={styles.card}>
        <div className={styles.fileIcon} aria-hidden="true">
          📄
        </div>

        {loading ? (
          <p className={styles.fileMeta}>Loading resume…</p>
        ) : resume ? (
          <>
            <h3 className={styles.fileName}>{resume.originalName}</h3>
            <p className={styles.fileMeta}>
              PDF · {formatBytes(resume.size)} · Updated{' '}
              {formatDate(resume.updatedAt)}
            </p>
          </>
        ) : (
          <>
            <h3 className={styles.fileName}>No resume uploaded</h3>
            <p className={styles.fileMeta}>
              Upload a PDF to make it available for download.
            </p>
          </>
        )}

        <div className={styles.actions}>
          <Button
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
            disabled={uploading}
          >
            {resume ? 'Replace' : 'Upload New'}
          </Button>
          {resume && (
            <Button
              variant="outline"
              onClick={() =>
                window.open(resume.url, '_blank', 'noopener,noreferrer')
              }
            >
              View
            </Button>
          )}
          {resume && (
            <Button
              variant="danger"
              onClick={() => setConfirmOpen(true)}
              disabled={deleting}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Resume"
        message="Are you sure you want to delete your resume? This action cannot be undone."
        confirmLabel="Delete Resume"
      />
    </div>
  );
}

export default ResumePage;
