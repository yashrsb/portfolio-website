import { useState } from 'react';
import Breadcrumb from '../../components/layout/Breadcrumb/Breadcrumb';
import Button from '../../components/common/Button/Button';
import Badge from '../../components/common/Badge/Badge';
import DataTable from '../../components/common/DataTable/DataTable';
import Modal from '../../components/common/Modal/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import SkeletonTable from '../../components/common/SkeletonTable/SkeletonTable';
import ApiErrorBanner from '../../components/common/errors/ApiErrorBanner/ApiErrorBanner';
import { useResource } from '../../hooks/useResource';
import { contactMessagesService } from '../../services';
import styles from './ContactMessagesPage.module.css';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'archived', label: 'Archived' },
];

const STATUS_VARIANT = {
  new: 'warning',
  read: 'info',
  archived: 'neutral',
};

const formatDate = (iso) =>
  new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const truncate = (text, max = 80) =>
  text && text.length > max ? `${text.slice(0, max)}…` : text;

/**
 * ContactMessagesPage — view, status-update, and delete contact messages
 * submitted through the public contact form.
 */
function ContactMessagesPage() {
  const {
    data: items,
    loading,
    error,
    update,
    remove,
    refresh,
    clearError,
  } = useResource(contactMessagesService);
  const [viewingItem, setViewingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filteredItems = items.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleStatusChange = async (item, newStatus) => {
    if (saving) return;
    setSaving(true);
    await update(item.id, { status: newStatus });
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    const ok = await remove(deleteTarget.id);
    setDeleting(false);
    if (ok) {
      setDeleteTarget(null);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'subject',
      label: 'Subject',
      render: (row) => truncate(row.subject, 60),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status] || 'neutral'}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'action',
      render: (row) => (
        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewingItem(row)}
            ariaLabel={`View message from ${row.name}`}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(row)}
            ariaLabel={`Delete message from ${row.name}`}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <Breadcrumb items={[{ label: 'Contact Messages' }]} />

      <div className={styles.header}>
        <h2 className={styles.heading}>Contact Messages</h2>
        <Button variant="outline" size="sm" onClick={refresh}>
          Refresh
        </Button>
      </div>

      <div className={styles.searchRow}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          aria-label="Search messages"
        />
      </div>

      {error && (
        <ApiErrorBanner
          error={error}
          onRetry={() => {
            if (error.isNetworkError) {
              refresh();
            } else {
              clearError();
            }
          }}
        />
      )}

      {loading ? (
        <SkeletonTable rows={6} columns={6} />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No messages found"
          description={
            searchQuery
              ? 'Try adjusting your search terms.'
              : 'Messages submitted through the contact form will appear here.'
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filteredItems}
          caption="Contact messages"
        />
      )}

      {/* View modal */}
      <Modal
        isOpen={Boolean(viewingItem)}
        onClose={() => setViewingItem(null)}
        title="Message Details"
        size="lg"
      >
        {viewingItem && (
          <div className={styles.detailRow}>
            <div className={styles.detailLabel}>Name</div>
            <div className={styles.detailValue}>{viewingItem.name}</div>
          </div>
        )}
        {viewingItem && (
          <div className={styles.detailRow}>
            <div className={styles.detailLabel}>Email</div>
            <div className={styles.detailValue}>
              <a
                href={`mailto:${viewingItem.email}`}
                rel="noopener noreferrer"
              >
                {viewingItem.email}
              </a>
            </div>
          </div>
        )}
        {viewingItem && (
          <div className={styles.detailRow}>
            <div className={styles.detailLabel}>Subject</div>
            <div className={styles.detailValue}>{viewingItem.subject}</div>
          </div>
        )}
        {viewingItem && (
          <div className={styles.detailRow}>
            <div className={styles.detailLabel}>Message</div>
            <div className={styles.detailValue}>
              <div className={styles.messageBody}>{viewingItem.message}</div>
            </div>
          </div>
        )}
        {viewingItem && (
          <div className={styles.detailRow}>
            <div className={styles.detailLabel}>Status</div>
            <div className={styles.detailValue}>
              <select
                className={styles.statusSelect}
                value={viewingItem.status}
                onChange={(event) =>
                  handleStatusChange(viewingItem, event.target.value)
                }
                disabled={saving}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        {viewingItem && (
          <div className={styles.metaInfo}>
            {viewingItem.ipAddress && (
              <span className={styles.metaItem}>
                IP: {viewingItem.ipAddress}
              </span>
            )}
            <span className={styles.metaItem}>
              Submitted: {formatDate(viewingItem.createdAt)}
            </span>
          </div>
        )}
        <div className={styles.formActions}>
          <Button variant="outline" onClick={() => setViewingItem(null)}>
            Close
          </Button>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Message"
        message={`Are you sure you want to delete the message from "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Message"
      />
    </div>
  );
}

export default ContactMessagesPage;
