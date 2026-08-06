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
import FormField from '../../components/form/FormField/FormField';
import TextInput from '../../components/form/TextInput/TextInput';
import TextArea from '../../components/form/TextArea/TextArea';
import Select from '../../components/form/Select/Select';
import Checkbox from '../../components/form/Checkbox/Checkbox';
import { useResource } from '../../hooks/useResource';
import { useDirtyForm } from '../../hooks/useDirtyForm';
import { projectService } from '../../services';
import { isRequired, isUrl } from '../../utils/validation';
import styles from './ProjectsPage.module.css';

const STATUS_OPTIONS = [
  { value: 'live', label: 'Live' },
  { value: 'wip', label: 'In Progress' },
  { value: 'archived', label: 'Archived' },
];

const STATUS_VARIANT = {
  live: 'success',
  wip: 'warning',
  archived: 'danger',
};

const EMPTY_FORM = {
  title: '',
  slug: '',
  summary: '',
  description: '',
  status: 'live',
  featured: false,
  githubUrl: '',
  demoUrl: '',
  imageUrl: '',
  displayOrder: '',
};

/**
 * ProjectsPage — full CRUD UI for portfolio projects backed by the real
 * projectService via useResource (optimistic updates, rollback, toasts).
 */
function ProjectsPage() {
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
  } = useResource(projectService);
  const { markDirty, resetDirty } = useDirtyForm();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      description: item.description,
      status: item.status,
      featured: item.featured,
      githubUrl: item.githubUrl,
      demoUrl: item.demoUrl,
      imageUrl: item.imageUrl,
      displayOrder: String(item.displayOrder),
    });
    setErrors({});
    setModalOpen(true);
  };

  const openView = (item) => setViewingId(item);

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    markDirty();
  };

  const validate = () => {
    const validationErrors = {};
    if (isRequired(form.title)) validationErrors.title = 'Title is required';
    if (isRequired(form.slug)) validationErrors.slug = 'Slug is required';
    if (isRequired(form.summary))
      validationErrors.summary = 'Summary is required';
    if (form.githubUrl && !isUrl(form.githubUrl))
      validationErrors.githubUrl = 'Enter a valid URL';
    if (form.demoUrl && !isUrl(form.demoUrl))
      validationErrors.demoUrl = 'Enter a valid URL';
    return validationErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

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
    if (ok) {
      setDeleteTarget(null);
    }
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

  const viewingItem = viewingId;

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'slug', label: 'Slug' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
      ),
    },
    {
      key: 'featured',
      label: 'Featured',
      render: (row) => (row.featured ? 'Yes' : 'No'),
    },
    {
      key: 'displayOrder',
      label: 'Order',
      type: 'number',
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'action',
      render: (row, idx) => (
        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openView(row)}
            ariaLabel={`View ${row.title}`}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEdit(row)}
            ariaLabel={`Edit ${row.title}`}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleMove(row, 'up')}
            disabled={idx === 0}
            ariaLabel={`Move ${row.title} up`}
          >
            ↑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleMove(row, 'down')}
            disabled={idx === items.length - 1}
            ariaLabel={`Move ${row.title} down`}
          >
            ↓
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(row)}
            ariaLabel={`Delete ${row.title}`}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <Breadcrumb items={[{ label: 'Projects' }]} />

      <div className={styles.header}>
        <h2 className={styles.heading}>Projects</h2>
        <Button onClick={openCreate}>+ New Project</Button>
      </div>

      <div className={styles.searchRow}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          aria-label="Search projects"
        />
        <Button variant="outline" size="sm" onClick={refresh}>
          Refresh
        </Button>
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
          title="No projects found"
          description="Try adjusting your search or create a new project to get started."
          action={<Button onClick={openCreate}>+ New Project</Button>}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filteredItems}
          caption="Portfolio projects"
        />
      )}

      {/* Create / Edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Project' : 'New Project'}
        size="lg"
      >
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.formGrid}>
            <FormField
              label="Title"
              htmlFor="project-title"
              error={errors.title}
              required
            >
              <TextInput
                id="project-title"
                name="title"
                value={form.title}
                onChange={handleChange}
                error={errors.title}
                disabled={submitting}
              />
            </FormField>

            <FormField
              label="Slug"
              htmlFor="project-slug"
              error={errors.slug}
              required
            >
              <TextInput
                id="project-slug"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                error={errors.slug}
                disabled={submitting}
              />
            </FormField>

            <FormField label="Status" htmlFor="project-status">
              <Select
                id="project-status"
                name="status"
                value={form.status}
                onChange={handleChange}
                options={STATUS_OPTIONS}
                disabled={submitting}
              />
            </FormField>

            <FormField label="Display Order" htmlFor="project-order">
              <TextInput
                id="project-order"
                name="displayOrder"
                type="number"
                value={form.displayOrder}
                onChange={handleChange}
                min={0}
                disabled={submitting}
              />
            </FormField>
          </div>

          <FormField
            label="Summary"
            htmlFor="project-summary"
            error={errors.summary}
            required
          >
            <TextInput
              id="project-summary"
              name="summary"
              value={form.summary}
              onChange={handleChange}
              error={errors.summary}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Description" htmlFor="project-description">
            <TextArea
              id="project-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              disabled={submitting}
            />
          </FormField>

          <div className={styles.formGrid}>
            <FormField
              label="GitHub URL"
              htmlFor="project-github"
              error={errors.githubUrl}
            >
              <TextInput
                id="project-github"
                name="githubUrl"
                value={form.githubUrl}
                onChange={handleChange}
                error={errors.githubUrl}
                disabled={submitting}
              />
            </FormField>

            <FormField
              label="Demo URL"
              htmlFor="project-demo"
              error={errors.demoUrl}
            >
              <TextInput
                id="project-demo"
                name="demoUrl"
                value={form.demoUrl}
                onChange={handleChange}
                error={errors.demoUrl}
                disabled={submitting}
              />
            </FormField>
          </div>

          <FormField label="Image URL" htmlFor="project-image">
            <TextInput
              id="project-image"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              disabled={submitting}
            />
          </FormField>

          <Checkbox
            id="project-featured"
            name="featured"
            checked={form.featured}
            onChange={handleChange}
            label="Featured project"
            disabled={submitting}
          />

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
              {editingId ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View modal */}
      <Modal
        isOpen={Boolean(viewingItem)}
        onClose={() => setViewingId(null)}
        title={viewingItem?.title || 'Project'}
      >
        {viewingItem && (
          <div className={styles.details}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Slug</span>
              <span>{viewingItem.slug}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Status</span>
              <Badge variant={STATUS_VARIANT[viewingItem.status]}>
                {viewingItem.status}
              </Badge>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Featured</span>
              <span>{viewingItem.featured ? 'Yes' : 'No'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Display Order</span>
              <span>{viewingItem.displayOrder}</span>
            </div>
            <p className={styles.detailDescription}>
              {viewingItem.description}
            </p>
            <div className={styles.detailLinks}>
              {viewingItem.githubUrl && (
                <a
                  href={viewingItem.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.detailLink}
                >
                  GitHub ↗
                </a>
              )}
              {viewingItem.demoUrl && (
                <a
                  href={viewingItem.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.detailLink}
                >
                  Live Demo ↗
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Project"
      />
    </div>
  );
}

export default ProjectsPage;
