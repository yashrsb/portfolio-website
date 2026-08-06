import { useState } from 'react';
import Breadcrumb from '../../components/layout/Breadcrumb/Breadcrumb';
import Button from '../../components/common/Button/Button';
import DataTable from '../../components/common/DataTable/DataTable';
import Modal from '../../components/common/Modal/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';
import SkeletonTable from '../../components/common/SkeletonTable/SkeletonTable';
import ApiErrorBanner from '../../components/common/errors/ApiErrorBanner/ApiErrorBanner';
import FormField from '../../components/form/FormField/FormField';
import TextInput from '../../components/form/TextInput/TextInput';
import { useResource } from '../../hooks/useResource';
import { useDirtyForm } from '../../hooks/useDirtyForm';
import { socialService } from '../../services';
import { isRequired, isUrl } from '../../utils/validation';
import styles from './SocialLinksPage.module.css';

const EMPTY_FORM = {
  platform: '',
  url: '',
  icon: '',
  displayOrder: '',
};

/**
 * SocialLinksPage — CRUD UI for social links backed by socialService.
 */
function SocialLinksPage() {
  const {
    data: items,
    loading,
    error,
    create,
    update,
    remove,
    reorder,
    refresh,
    clearError,
  } = useResource(socialService);
  const { markDirty, resetDirty } = useDirtyForm();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (item) => {
    if (!item) return;
    setEditingId(item.id);
    setForm({
      platform: item.platform,
      url: item.url,
      icon: item.icon,
      displayOrder: String(item.displayOrder),
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    markDirty();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const validationErrors = {};
    if (isRequired(form.platform))
      validationErrors.platform = 'Platform is required';
    if (isRequired(form.url)) validationErrors.url = 'URL is required';
    if (form.url && !isUrl(form.url))
      validationErrors.url = 'Enter a valid URL';

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      ...form,
      displayOrder: Number(form.displayOrder) || 0,
    };

    setSubmitting(true);
    const result = editingId
      ? await update(editingId, payload)
      : await create(payload);

    if (result) {
      resetDirty();
      setModalOpen(false);
      setEditingId(null);
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    const ok = await remove(deleteTarget.id);
    setDeleting(false);
    if (ok) setDeleteTarget(null);
  };

  const handleMove = async (item, direction) => {
    const index = items.findIndex((i) => i.id === item.id);
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;

    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    const reordered = next.map((i, idx) => ({
      id: i.id,
      displayOrder: idx + 1,
    }));
    await reorder(reordered);
  };

  const columns = [
    {
      key: 'icon',
      label: 'Icon',
      render: (row) => <span aria-hidden="true">{row.icon || '—'}</span>,
    },
    { key: 'platform', label: 'Platform' },
    {
      key: 'url',
      label: 'URL',
      render: (row) =>
        row.url ? (
          <a
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            {row.url.replace(/^https?:\/\//, '')}
          </a>
        ) : (
          '—'
        ),
    },
    { key: 'displayOrder', label: 'Order', type: 'number' },
    {
      key: 'actions',
      label: 'Actions',
      type: 'action',
      render: (row, idx) => (
        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEdit(row)}
            ariaLabel={`Edit ${row.platform}`}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleMove(row, 'up')}
            disabled={idx === 0}
            ariaLabel={`Move ${row.platform} up`}
          >
            ↑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleMove(row, 'down')}
            disabled={idx === items.length - 1}
            ariaLabel={`Move ${row.platform} down`}
          >
            ↓
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(row)}
            ariaLabel={`Delete ${row.platform}`}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <Breadcrumb items={[{ label: 'Social Links' }]} />

      <div className={styles.header}>
        <h2 className={styles.heading}>Social Links</h2>
        <div className={styles.actions}>
          <Button variant="outline" size="sm" onClick={refresh}>
            Refresh
          </Button>
          <Button onClick={openCreate}>+ New Link</Button>
        </div>
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
        <SkeletonTable rows={4} columns={5} />
      ) : (
        <DataTable
          columns={columns}
          rows={items}
          caption="Social links"
          emptyMessage="No social links yet."
        />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Social Link' : 'New Social Link'}
      >
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <FormField
            label="Platform"
            htmlFor="social-platform"
            error={errors.platform}
            required
          >
            <TextInput
              id="social-platform"
              name="platform"
              value={form.platform}
              onChange={handleChange}
              error={errors.platform}
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="URL"
            htmlFor="social-url"
            error={errors.url}
            required
          >
            <TextInput
              id="social-url"
              name="url"
              value={form.url}
              onChange={handleChange}
              error={errors.url}
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Icon"
            htmlFor="social-icon"
            hint="Emoji or short label"
          >
            <TextInput
              id="social-icon"
              name="icon"
              value={form.icon}
              onChange={handleChange}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Display Order" htmlFor="social-order">
            <TextInput
              id="social-order"
              name="displayOrder"
              type="number"
              value={form.displayOrder}
              onChange={handleChange}
              min={0}
              disabled={submitting}
            />
          </FormField>

          <div className={styles.formActions}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting} disabled={submitting}>
              {editingId ? 'Save Changes' : 'Create Link'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Social Link"
        message={`Are you sure you want to delete "${deleteTarget?.platform}"? This action cannot be undone.`}
        confirmLabel="Delete Link"
      />
    </div>
  );
}

export default SocialLinksPage;
