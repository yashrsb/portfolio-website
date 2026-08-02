import { useState } from 'react';
import Breadcrumb from '../../components/layout/Breadcrumb/Breadcrumb';
import Button from '../../components/common/Button/Button';
import DataTable from '../../components/common/DataTable/DataTable';
import Modal from '../../components/common/Modal/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';
import FormField from '../../components/form/FormField/FormField';
import TextInput from '../../components/form/TextInput/TextInput';
import Select from '../../components/form/Select/Select';
import { useCrud } from '../../hooks/useCrud';
import { socialLinks as initialSocialLinks } from '../../data/mockData';
import { isRequired, isUrl } from '../../utils/validation';
import { useToast } from '../../context/ToastContext';
import styles from './SocialLinksPage.module.css';

const PLATFORM_OPTIONS = [
  { value: 'GitHub', label: 'GitHub' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Twitter', label: 'Twitter' },
  { value: 'Email', label: 'Email' },
  { value: 'Website', label: 'Website' },
  { value: 'Other', label: 'Other' },
];

const EMPTY_FORM = {
  platform: 'GitHub',
  url: '',
  icon: '',
  displayOrder: '',
};

/**
 * SocialLinksPage — CRUD UI for social links (mock handlers).
 */
function SocialLinksPage() {
  const { items, createItem, updateItem, deleteItem, getItem } =
    useCrud(initialSocialLinks);
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (id) => {
    const item = getItem(id);
    if (!item) return;
    setEditingId(id);
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
  };

  const handleSubmit = (event) => {
    event.preventDefault();

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

    if (editingId) {
      updateItem(editingId, payload);
      showToast('success', 'Social link updated successfully.');
    } else {
      createItem(payload);
      showToast('success', 'Social link created successfully.');
    }

    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteItem(deleteTarget.id);
    showToast('success', 'Social link deleted successfully.');
    setDeleteTarget(null);
  };

  const columns = [
    { key: 'platform', label: 'Platform' },
    {
      key: 'url',
      label: 'URL',
      render: (row) => (
        <a
          href={row.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          {row.url}
        </a>
      ),
    },
    {
      key: 'icon',
      label: 'Icon',
      render: (row) => <span aria-hidden="true">{row.icon || '—'}</span>,
    },
    { key: 'displayOrder', label: 'Order', type: 'number' },
    {
      key: 'actions',
      label: 'Actions',
      type: 'action',
      render: (row) => (
        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEdit(row.id)}
            ariaLabel={`Edit ${row.platform}`}
          >
            Edit
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
        <Button onClick={openCreate}>+ New Link</Button>
      </div>

      <DataTable
        columns={columns}
        rows={items}
        caption="Social links"
        emptyMessage="No social links yet."
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Social Link' : 'New Social Link'}
      >
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <FormField
            label="Platform"
            htmlFor="link-platform"
            error={errors.platform}
            required
          >
            <Select
              id="link-platform"
              name="platform"
              value={form.platform}
              onChange={handleChange}
              options={PLATFORM_OPTIONS}
              error={errors.platform}
            />
          </FormField>

          <FormField label="URL" htmlFor="link-url" error={errors.url} required>
            <TextInput
              id="link-url"
              name="url"
              value={form.url}
              onChange={handleChange}
              error={errors.url}
            />
          </FormField>

          <FormField
            label="Icon"
            htmlFor="link-icon"
            hint="Emoji or short label"
          >
            <TextInput
              id="link-icon"
              name="icon"
              value={form.icon}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="Display Order" htmlFor="link-order">
            <TextInput
              id="link-order"
              name="displayOrder"
              type="number"
              value={form.displayOrder}
              onChange={handleChange}
              min={0}
            />
          </FormField>

          <div className={styles.formActions}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
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
        message={`Are you sure you want to delete the ${deleteTarget?.platform} link? This action cannot be undone.`}
        confirmLabel="Delete Link"
      />
    </div>
  );
}

export default SocialLinksPage;
