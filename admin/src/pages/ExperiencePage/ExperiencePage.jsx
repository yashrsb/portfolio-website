import { useState } from 'react';
import Breadcrumb from '../../components/layout/Breadcrumb/Breadcrumb';
import Button from '../../components/common/Button/Button';
import Badge from '../../components/common/Badge/Badge';
import DataTable from '../../components/common/DataTable/DataTable';
import Modal from '../../components/common/Modal/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';
import FormField from '../../components/form/FormField/FormField';
import TextInput from '../../components/form/TextInput/TextInput';
import TextArea from '../../components/form/TextArea/TextArea';
import Checkbox from '../../components/form/Checkbox/Checkbox';
import { useCrud } from '../../hooks/useCrud';
import { experience as initialExperience } from '../../data/mockData';
import { isRequired } from '../../utils/validation';
import { useToast } from '../../context/ToastContext';
import styles from './ExperiencePage.module.css';

const EMPTY_FORM = {
  company: '',
  role: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
  displayOrder: '',
};

/**
 * ExperiencePage — CRUD UI for work experience entries (mock handlers).
 */
function ExperiencePage() {
  const { items, createItem, updateItem, deleteItem, getItem } =
    useCrud(initialExperience);
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
      company: item.company,
      role: item.role,
      startDate: item.startDate,
      endDate: item.endDate,
      current: item.current,
      description: item.description,
      displayOrder: String(item.displayOrder),
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = {};
    if (isRequired(form.company))
      validationErrors.company = 'Company is required';
    if (isRequired(form.role)) validationErrors.role = 'Role is required';
    if (isRequired(form.startDate))
      validationErrors.startDate = 'Start date is required';
    if (!form.current && isRequired(form.endDate))
      validationErrors.endDate = 'End date is required unless current';

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      ...form,
      displayOrder: Number(form.displayOrder) || 0,
    };

    if (editingId) {
      updateItem(editingId, payload);
      showToast('success', 'Experience updated successfully.');
    } else {
      createItem(payload);
      showToast('success', 'Experience created successfully.');
    }

    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteItem(deleteTarget.id);
    showToast('success', 'Experience deleted successfully.');
    setDeleteTarget(null);
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const [year] = value.split('-');
    const monthName = new Date(`${value}-01T00:00:00`).toLocaleString('en', {
      month: 'short',
    });
    return `${monthName} ${year}`;
  };

  const columns = [
    { key: 'company', label: 'Company' },
    { key: 'role', label: 'Role' },
    {
      key: 'period',
      label: 'Period',
      render: (row) =>
        `${formatDate(row.startDate)} — ${row.current ? 'Present' : formatDate(row.endDate)}`,
    },
    {
      key: 'current',
      label: 'Status',
      render: (row) =>
        row.current ? (
          <Badge variant="success">Current</Badge>
        ) : (
          <Badge>Past</Badge>
        ),
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
            ariaLabel={`Edit ${row.company}`}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(row)}
            ariaLabel={`Delete ${row.company}`}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <Breadcrumb items={[{ label: 'Experience' }]} />

      <div className={styles.header}>
        <h2 className={styles.heading}>Experience</h2>
        <Button onClick={openCreate}>+ New Experience</Button>
      </div>

      <DataTable
        columns={columns}
        rows={items}
        caption="Work experience"
        emptyMessage="No experience entries yet."
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Experience' : 'New Experience'}
      >
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <FormField
            label="Company"
            htmlFor="exp-company"
            error={errors.company}
            required
          >
            <TextInput
              id="exp-company"
              name="company"
              value={form.company}
              onChange={handleChange}
              error={errors.company}
            />
          </FormField>

          <FormField
            label="Role"
            htmlFor="exp-role"
            error={errors.role}
            required
          >
            <TextInput
              id="exp-role"
              name="role"
              value={form.role}
              onChange={handleChange}
              error={errors.role}
            />
          </FormField>

          <div className={styles.formGrid}>
            <FormField
              label="Start Date"
              htmlFor="exp-start"
              error={errors.startDate}
              required
            >
              <TextInput
                id="exp-start"
                name="startDate"
                type="month"
                value={form.startDate}
                onChange={handleChange}
                error={errors.startDate}
              />
            </FormField>

            <FormField
              label="End Date"
              htmlFor="exp-end"
              error={errors.endDate}
              hint="Not required if current"
            >
              <TextInput
                id="exp-end"
                name="endDate"
                type="month"
                value={form.endDate}
                onChange={handleChange}
                error={errors.endDate}
                disabled={form.current}
              />
            </FormField>
          </div>

          <Checkbox
            id="exp-current"
            name="current"
            checked={form.current}
            onChange={handleChange}
            label="I currently work here"
          />

          <FormField label="Description" htmlFor="exp-description">
            <TextArea
              id="exp-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
            />
          </FormField>

          <FormField label="Display Order" htmlFor="exp-order">
            <TextInput
              id="exp-order"
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
              {editingId ? 'Save Changes' : 'Create Experience'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Experience"
        message={`Are you sure you want to delete the entry at "${deleteTarget?.company}"? This action cannot be undone.`}
        confirmLabel="Delete Experience"
      />
    </div>
  );
}

export default ExperiencePage;
