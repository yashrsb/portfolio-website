import { useState } from 'react';
import Breadcrumb from '../../components/layout/Breadcrumb/Breadcrumb';
import Button from '../../components/common/Button/Button';
import Badge from '../../components/common/Badge/Badge';
import DataTable from '../../components/common/DataTable/DataTable';
import Modal from '../../components/common/Modal/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';
import FormField from '../../components/form/FormField/FormField';
import TextInput from '../../components/form/TextInput/TextInput';
import Select from '../../components/form/Select/Select';
import { useCrud } from '../../hooks/useCrud';
import { skills as initialSkills } from '../../data/mockData';
import { isRequired, isValidPercentage } from '../../utils/validation';
import { useToast } from '../../context/ToastContext';
import styles from './SkillsPage.module.css';

const CATEGORY_OPTIONS = [
  { value: 'Languages', label: 'Languages' },
  { value: 'Frontend', label: 'Frontend' },
  { value: 'Backend', label: 'Backend' },
  { value: 'Databases', label: 'Databases' },
  { value: 'Cloud', label: 'Cloud' },
  { value: 'Tools', label: 'Tools' },
];

const EMPTY_FORM = {
  name: '',
  category: 'Languages',
  proficiency: '',
  icon: '',
  displayOrder: '',
};

/**
 * SkillsPage — CRUD UI for portfolio skills (mock handlers).
 */
function SkillsPage() {
  const { items, createItem, updateItem, deleteItem, getItem } =
    useCrud(initialSkills);
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
      name: item.name,
      category: item.category,
      proficiency: String(item.proficiency),
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
    if (isRequired(form.name)) validationErrors.name = 'Skill name is required';
    if (!isValidPercentage(form.proficiency))
      validationErrors.proficiency = 'Enter a value between 0 and 100';

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      ...form,
      proficiency: Number(form.proficiency),
      displayOrder: Number(form.displayOrder) || 0,
    };

    if (editingId) {
      updateItem(editingId, payload);
      showToast('success', 'Skill updated successfully.');
    } else {
      createItem(payload);
      showToast('success', 'Skill created successfully.');
    }

    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteItem(deleteTarget.id);
    showToast('success', 'Skill deleted successfully.');
    setDeleteTarget(null);
  };

  const columns = [
    {
      key: 'icon',
      label: 'Icon',
      render: (row) => <span aria-hidden="true">{row.icon || '—'}</span>,
    },
    { key: 'name', label: 'Skill' },
    {
      key: 'category',
      label: 'Category',
      render: (row) => <Badge variant="info">{row.category}</Badge>,
    },
    {
      key: 'proficiency',
      label: 'Proficiency',
      render: (row) => `${row.proficiency}%`,
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
    <div className={styles.page}>
      <Breadcrumb items={[{ label: 'Skills' }]} />

      <div className={styles.header}>
        <h2 className={styles.heading}>Skills</h2>
        <Button onClick={openCreate}>+ New Skill</Button>
      </div>

      <DataTable
        columns={columns}
        rows={items}
        caption="Portfolio skills"
        emptyMessage="No skills yet. Create your first skill to get started."
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Skill' : 'New Skill'}
      >
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <FormField
            label="Skill Name"
            htmlFor="skill-name"
            error={errors.name}
            required
          >
            <TextInput
              id="skill-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />
          </FormField>

          <FormField label="Category" htmlFor="skill-category">
            <Select
              id="skill-category"
              name="category"
              value={form.category}
              onChange={handleChange}
              options={CATEGORY_OPTIONS}
            />
          </FormField>

          <FormField
            label="Proficiency (0–100)"
            htmlFor="skill-proficiency"
            error={errors.proficiency}
            required
          >
            <TextInput
              id="skill-proficiency"
              name="proficiency"
              type="number"
              value={form.proficiency}
              onChange={handleChange}
              error={errors.proficiency}
              min={0}
              max={100}
            />
          </FormField>

          <FormField
            label="Icon"
            htmlFor="skill-icon"
            hint="Emoji or short label"
          >
            <TextInput
              id="skill-icon"
              name="icon"
              value={form.icon}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="Display Order" htmlFor="skill-order">
            <TextInput
              id="skill-order"
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
              {editingId ? 'Save Changes' : 'Create Skill'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Skill"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Skill"
      />
    </div>
  );
}

export default SkillsPage;
