import { useState, useEffect } from 'react';
import Breadcrumb from '../../components/layout/Breadcrumb/Breadcrumb';
import Button from '../../components/common/Button/Button';
import Badge from '../../components/common/Badge/Badge';
import DataTable from '../../components/common/DataTable/DataTable';
import Modal from '../../components/common/Modal/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';
import SkeletonTable from '../../components/common/SkeletonTable/SkeletonTable';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import ApiErrorBanner from '../../components/common/errors/ApiErrorBanner/ApiErrorBanner';
import FormField from '../../components/form/FormField/FormField';
import TextInput from '../../components/form/TextInput/TextInput';
import TextArea from '../../components/form/TextArea/TextArea';
import Select from '../../components/form/Select/Select';
import Checkbox from '../../components/form/Checkbox/Checkbox';
import { useResource } from '../../hooks/useResource';
import { useDirtyForm } from '../../hooks/useDirtyForm';
import {
  blogPostService,
  blogCategoryService,
  blogTagService,
} from '../../services';
import MarkdownPreview from '../../components/blog/MarkdownPreview/MarkdownPreview';
import { isRequired } from '../../utils/validation';
import styles from './BlogPostsPage.module.css';

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const STATUS_VARIANT = {
  DRAFT: 'warning',
  PUBLISHED: 'success',
  ARCHIVED: 'danger',
};

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  status: 'DRAFT',
  publishedAt: '',
  author: '',
  featured: false,
  seoTitle: '',
  seoDescription: '',
  canonicalUrl: '',
  categoryId: '',
  tagIds: [],
};

function BlogPostsPage() {
  const {
    data: items,
    loading,
    error,
    create,
    update,
    remove,
    refresh,
    clearError,
  } = useResource(blogPostService);
  const { markDirty, resetDirty } = useDirtyForm();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    loadCategories();
    loadTags();
  }, []);

  const loadCategories = async () => {
    const cats = await blogCategoryService.list();
    setCategories(cats || []);
  };

  const loadTags = async () => {
    const tg = await blogTagService.list();
    setTags(tg || []);
  };

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.slug.toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (item) => {
    if (!item) return;
    setEditingId(item.id);
    const tagIds = item.tags?.map((t) => t.id) || [];
    setForm({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || '',
      content: item.content,
      coverImage: item.coverImage || '',
      status: item.status || 'DRAFT',
      publishedAt: item.publishedAt
        ? new Date(item.publishedAt).toISOString().slice(0, 16)
        : '',
      author: item.author || '',
      featured: item.featured,
      seoTitle: item.seoTitle || '',
      seoDescription: item.seoDescription || '',
      canonicalUrl: item.canonicalUrl || '',
      categoryId: item.category?.id || '',
      tagIds,
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    markDirty();
  };

  const handleTagsChange = (tagId) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
    markDirty();
  };

  const validate = () => {
    const validationErrors = {};
    if (isRequired(form.title)) validationErrors.title = 'Title is required';
    if (isRequired(form.slug)) validationErrors.slug = 'Slug is required';
    if (isRequired(form.content))
      validationErrors.content = 'Content is required';
    return validationErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || null,
      content: form.content,
      coverImage: form.coverImage || null,
      status: form.status,
      publishedAt: form.publishedAt
        ? new Date(form.publishedAt).toISOString()
        : null,
      author: form.author || null,
      featured: form.featured,
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
      canonicalUrl: form.canonicalUrl || null,
      categoryId: form.categoryId || null,
      tagIds: form.tagIds,
    };

    setSubmitting(true);
    let result;
    if (editingId) {
      result = await update(editingId, payload);
    } else {
      result = await create(payload);
    }

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

  const handlePublish = async (item) => {
    if (item.status === 'PUBLISHED') {
      await blogPostService.unpublish(item.id);
    } else {
      await blogPostService.publish(item.id);
    }
    refresh();
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'slug', label: 'Slug' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status] || 'default'}>
          {row.status || 'DRAFT'}
        </Badge>
      ),
    },
    {
      key: 'featured',
      label: 'Featured',
      render: (row) => (row.featured ? 'Yes' : 'No'),
    },
    {
      key: 'publishedAt',
      label: 'Published',
      render: (row) =>
        row.publishedAt
          ? new Date(row.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : '—',
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
            onClick={() => handlePublish(row)}
            ariaLabel={
              row.status === 'PUBLISHED'
                ? `Unpublish ${row.title}`
                : `Publish ${row.title}`
            }
          >
            {row.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
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
    <div>
      <Breadcrumb
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Blog Posts', to: '/blog' },
        ]}
      />

      <div className={styles.toolbar}>
        <input
          type="search"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
          aria-label="Search posts"
        />
        <Button variant="primary" size="sm" onClick={openCreate}>
          New Post
        </Button>
      </div>

      {error && <ApiErrorBanner error={error} onDismiss={clearError} />}

      {loading ? (
        <SkeletonTable rows={5} />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No blog posts found"
          description={
            searchQuery
              ? 'Try adjusting your search terms.'
              : 'Create your first blog post to get started.'
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filteredItems}
          caption="Blog posts"
        />
      )}

      {/* Blog post form modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetDirty();
        }}
        title={editingId ? 'Edit Blog Post' : 'New Blog Post'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <FormField label="Title" required error={errors.title}>
                <TextInput
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  error={errors.title}
                  required
                />
              </FormField>
            </div>

            <div className={styles.formGroup}>
              <FormField label="Slug" required error={errors.slug}>
                <TextInput
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  error={errors.slug}
                  required
                  placeholder="building-a-real-time-leaderboard"
                />
              </FormField>
            </div>

            <div className={styles.formGroup}>
              <FormField label="Status">
                <Select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  options={STATUS_OPTIONS}
                />
              </FormField>
            </div>

            <div className={styles.formGroup}>
              <FormField label="Cover Image URL">
                <TextInput
                  name="coverImage"
                  value={form.coverImage}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </FormField>
            </div>

            <div className={styles.formGroup}>
              <FormField label="Category">
                <Select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'None' },
                    ...categories.map((c) => ({
                      value: c.id,
                      label: c.name,
                    })),
                  ]}
                />
              </FormField>
            </div>

            <div className={styles.formGroup}>
              <FormField label="Author">
                <TextInput
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  placeholder="Yash R. S. B."
                />
              </FormField>
            </div>

            <div className={styles.formGroup}>
              <FormField label="Published Date">
                <input
                  type="datetime-local"
                  name="publishedAt"
                  value={form.publishedAt}
                  onChange={handleChange}
                  className={styles.datetimeInput}
                  disabled={form.status !== 'PUBLISHED'}
                />
              </FormField>
            </div>

            <div className={styles.formGroup}>
              <Checkbox
                name="featured"
                checked={form.featured}
                onChange={handleChange}
                label="Featured post"
                id="featured"
              />
            </div>

            <div className={styles.formFull}>
              <FormField label="Excerpt" error={errors.excerpt}>
                <TextArea
                  name="excerpt"
                  value={form.excerpt}
                  onChange={handleChange}
                  error={errors.excerpt}
                  rows={3}
                  placeholder="Short summary (1-2 sentences)"
                />
              </FormField>
            </div>

            <div className={styles.formFull}>
              <FormField
                label="Tags"
                helperText="Click to toggle tag selection"
              >
                <div className={styles.tagSelector}>
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      className={[
                        styles.tagOption,
                        form.tagIds.includes(tag.id)
                          ? styles.tagOptionSelected
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => handleTagsChange(tag.id)}
                      aria-pressed={form.tagIds.includes(tag.id)}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>

            <div className={styles.formFull}>
              <FormField label="Markdown Content" error={errors.content}>
                <div className={styles.editorContainer}>
                  <TextArea
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    error={errors.content}
                    rows={14}
                    placeholder="# Your article starts here..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewOpen(true)}
                    disabled={!form.content}
                    className={styles.previewButton}
                  >
                    Preview
                  </Button>
                </div>
              </FormField>
            </div>

            <div className={styles.formFull}>
              <FormField label="SEO Title">
                <TextInput
                  name="seoTitle"
                  value={form.seoTitle}
                  onChange={handleChange}
                  placeholder="Defaults to post title"
                />
              </FormField>
            </div>

            <div className={styles.formFull}>
              <FormField label="SEO Description">
                <TextArea
                  name="seoDescription"
                  value={form.seoDescription}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Defaults to excerpt"
                />
              </FormField>
            </div>

            <div className={styles.formFull}>
              <FormField label="Canonical URL">
                <TextInput
                  name="canonicalUrl"
                  value={form.canonicalUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/article"
                />
              </FormField>
            </div>
          </div>

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

      {/* Markdown preview modal */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Markdown Preview"
        size="lg"
      >
        <div className={styles.previewContent}>
          <MarkdownPreview content={form.content} />
        </div>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

export default BlogPostsPage;
