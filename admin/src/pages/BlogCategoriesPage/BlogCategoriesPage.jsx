import { useState } from 'react';
import Breadcrumb from '../../components/layout/Breadcrumb/Breadcrumb';
import Button from '../../components/common/Button/Button';
import DataTable from '../../components/common/DataTable/DataTable';
import Modal from '../../components/common/Modal/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';
import SkeletonTable from '../../components/common/SkeletonTable/SkeletonTable';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import ApiErrorBanner from '../../components/common/errors/ApiErrorBanner/ApiErrorBanner';
import FormField from '../../components/form/FormField/FormField';
import TextInput from '../../components/form/TextInput/TextInput';
import TextArea from '../../components/form/TextArea/TextArea';
import { useResource } from '../../hooks/useResource';
import { useDirtyForm } from '../../hooks/useDirtyForm';
import { blogCategoryService } from '../../services';
import { isRequired } from '../../utils/validation';
import styles from './BlogCategoriesPage.module.css';

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
};

function BlogCategoriesPage() {
  const {
    data: items,
    loading,
    error,
    create,
    update,
    remove,
    clearError,
  } = useResource(blogCategoryService);
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
      name: item.name,
      slug: item.slug,
      description: item.description || '',
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

  const validate = () => {
    const validationErrors = {};
    if (isRequired(form.name)) validationErrors.name = 'Name is required';
    if (isRequired(form.slug)) validationErrors.slug = 'Slug is required';
    return validationErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    const result = editingId
      ? await update(editingId, form)
      : await create(form);

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

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'slug', label: 'Slug' },
    {
      key: 'description',
      label: 'Description',
      render: (row) => row.description || '—',
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
            onClick={() => openEdit(row)}
            ariaLabel={`Edit ${row.name}`}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(row)}
            ariaLabel={`Delete ${row.name}`}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Blog', to: '/blog' },
          { label: 'Categories', to: '/blog/categories' },
        ]}
      />

      <div className={styles.toolbar}>
        <h2 className={styles.toolbarTitle}>Categories</h2>
        <Button variant="primary" size="sm" onClick={openCreate}>
          New Category
        </Button>
      </div>

      {error && <ApiErrorBanner error={error} onDismiss={clearError} />}

      {loading ? (
        <SkeletonTable rows={5} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No categories found"
          description="Create a category to organize your blog posts."
        />
      ) : (
        <DataTable columns={columns} rows={items} caption="Blog categories" />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetDirty();
        }}
        title={editingId ? 'Edit Category' : 'New Category'}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <FormField label="Name" required error={errors.name}>
            <TextInput
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
          </FormField>

          <FormField label="Slug" required error={errors.slug}>
            <TextInput
              name="slug"
              value={form.slug}
              onChange={handleChange}
              error={errors.slug}
              required
              placeholder="backend"
            />
          </FormField>

          <FormField label="Description">
            <TextArea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Optional description"
            />
          </FormField>

          <div className={styles.formActions}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setModalOpen(false);
                resetDirty();
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              disabled={submitting}
            >
              {editingId ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

export default BlogCategoriesPage;
