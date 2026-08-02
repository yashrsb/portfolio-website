import { useState } from 'react';
import Breadcrumb from '../../components/layout/Breadcrumb/Breadcrumb';
import Button from '../../components/common/Button/Button';
import DataTable from '../../components/common/DataTable/DataTable';
import Modal from '../../components/common/Modal/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';
import FormField from '../../components/form/FormField/FormField';
import TextInput from '../../components/form/TextInput/TextInput';
import TextArea from '../../components/form/TextArea/TextArea';
import { useCrud } from '../../hooks/useCrud';
import {
  education as initialEducation,
  certificates as initialCertificates,
  achievements as initialAchievements,
} from '../../data/mockData';
import { isRequired, isUrl } from '../../utils/validation';
import { useToast } from '../../context/ToastContext';
import styles from './EducationPage.module.css';

const EMPTY_EDUCATION = {
  institution: '',
  degree: '',
  field: '',
  startYear: '',
  endYear: '',
  description: '',
};

const EMPTY_CERTIFICATE = {
  name: '',
  issuer: '',
  year: '',
  url: '',
};

const EMPTY_ACHIEVEMENT = {
  title: '',
  organization: '',
  year: '',
  description: '',
};

/**
 * EducationPage — CRUD UI for education, certificates, and achievements.
 */
function EducationPage() {
  const educationCrud = useCrud(initialEducation);
  const certificateCrud = useCrud(initialCertificates);
  const achievementCrud = useCrud(initialAchievements);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('education');

  // Shared modal state (type determines which resource is being edited).
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [educationForm, setEducationForm] = useState(EMPTY_EDUCATION);
  const [certificateForm, setCertificateForm] = useState(EMPTY_CERTIFICATE);
  const [achievementForm, setAchievementForm] = useState(EMPTY_ACHIEVEMENT);
  const [errors, setErrors] = useState({});

  const openCreate = () => {
    setEditingId(null);
    setErrors({});
    setModalType(activeTab);
    if (activeTab === 'education') setEducationForm(EMPTY_EDUCATION);
    if (activeTab === 'certificates') setCertificateForm(EMPTY_CERTIFICATE);
    if (activeTab === 'achievements') setAchievementForm(EMPTY_ACHIEVEMENT);
    setModalOpen(true);
  };

  const openEdit = (resource, id) => {
    setEditingId(id);
    setErrors({});
    setModalType(resource);

    if (resource === 'education') {
      const item = educationCrud.getItem(id);
      if (!item) return;
      setEducationForm({ ...item });
    } else if (resource === 'certificates') {
      const item = certificateCrud.getItem(id);
      if (!item) return;
      setCertificateForm({
        name: item.name,
        issuer: item.issuer,
        year: item.year,
        url: item.url,
      });
    } else if (resource === 'achievements') {
      const item = achievementCrud.getItem(id);
      if (!item) return;
      setAchievementForm({
        title: item.title,
        organization: item.organization,
        year: item.year,
        description: item.description,
      });
    }

    setModalOpen(true);
  };

  const handleEducationChange = (event) => {
    const { name, value } = event.target;
    setEducationForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCertificateChange = (event) => {
    const { name, value } = event.target;
    setCertificateForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAchievementChange = (event) => {
    const { name, value } = event.target;
    setAchievementForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = {};

    if (modalType === 'education') {
      if (isRequired(educationForm.institution))
        validationErrors.institution = 'Institution is required';
      if (isRequired(educationForm.degree))
        validationErrors.degree = 'Degree is required';
    } else if (modalType === 'certificates') {
      if (isRequired(certificateForm.name))
        validationErrors.name = 'Certificate name is required';
      if (isRequired(certificateForm.issuer))
        validationErrors.issuer = 'Issuer is required';
      if (certificateForm.url && !isUrl(certificateForm.url))
        validationErrors.url = 'Enter a valid URL';
    } else if (modalType === 'achievements') {
      if (isRequired(achievementForm.title))
        validationErrors.title = 'Title is required';
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    if (modalType === 'education') {
      if (editingId) {
        educationCrud.updateItem(editingId, educationForm);
        showToast('success', 'Education updated successfully.');
      } else {
        educationCrud.createItem(educationForm);
        showToast('success', 'Education created successfully.');
      }
    } else if (modalType === 'certificates') {
      if (editingId) {
        certificateCrud.updateItem(editingId, certificateForm);
        showToast('success', 'Certificate updated successfully.');
      } else {
        certificateCrud.createItem(certificateForm);
        showToast('success', 'Certificate created successfully.');
      }
    } else if (modalType === 'achievements') {
      if (editingId) {
        achievementCrud.updateItem(editingId, achievementForm);
        showToast('success', 'Achievement updated successfully.');
      } else {
        achievementCrud.createItem(achievementForm);
        showToast('success', 'Achievement created successfully.');
      }
    }

    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const { resource, id } = deleteTarget;
    if (resource === 'education') educationCrud.deleteItem(id);
    if (resource === 'certificates') certificateCrud.deleteItem(id);
    if (resource === 'achievements') achievementCrud.deleteItem(id);
    showToast('success', 'Entry deleted successfully.');
    setDeleteTarget(null);
  };

  const deleteColumns = [
    {
      key: 'actions',
      label: 'Actions',
      type: 'action',
      render: (row) => (
        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEdit(activeTab, row.id)}
            ariaLabel={`Edit ${row.title || row.name || row.institution}`}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget({ resource: activeTab, id: row.id })}
            ariaLabel={`Delete ${row.title || row.name || row.institution}`}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const renderTabContent = () => {
    if (activeTab === 'education') {
      const columns = [
        { key: 'institution', label: 'Institution' },
        { key: 'degree', label: 'Degree' },
        { key: 'field', label: 'Field' },
        { key: 'startYear', label: 'Start', type: 'number' },
        { key: 'endYear', label: 'End', type: 'number' },
        ...deleteColumns,
      ];
      return (
        <DataTable
          columns={columns}
          rows={educationCrud.items}
          caption="Education entries"
          emptyMessage="No education entries yet."
        />
      );
    }

    if (activeTab === 'certificates') {
      const columns = [
        { key: 'name', label: 'Certificate' },
        { key: 'issuer', label: 'Issuer' },
        { key: 'year', label: 'Year' },
        {
          key: 'url',
          label: 'Link',
          render: (row) =>
            row.url ? (
              <a
                href={row.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                View ↗
              </a>
            ) : (
              '—'
            ),
        },
        ...deleteColumns,
      ];
      return (
        <DataTable
          columns={columns}
          rows={certificateCrud.items}
          caption="Certificates"
          emptyMessage="No certificates yet."
        />
      );
    }

    const columns = [
      { key: 'title', label: 'Title' },
      { key: 'organization', label: 'Organization' },
      { key: 'year', label: 'Year' },
      ...deleteColumns,
    ];
    return (
      <DataTable
        columns={columns}
        rows={achievementCrud.items}
        caption="Achievements"
        emptyMessage="No achievements yet."
      />
    );
  };

  const renderModalForm = () => {
    if (modalType === 'education') {
      return (
        <>
          <FormField
            label="Institution"
            htmlFor="edu-institution"
            error={errors.institution}
            required
          >
            <TextInput
              id="edu-institution"
              name="institution"
              value={educationForm.institution}
              onChange={handleEducationChange}
              error={errors.institution}
            />
          </FormField>
          <FormField
            label="Degree"
            htmlFor="edu-degree"
            error={errors.degree}
            required
          >
            <TextInput
              id="edu-degree"
              name="degree"
              value={educationForm.degree}
              onChange={handleEducationChange}
              error={errors.degree}
            />
          </FormField>
          <FormField label="Field of Study" htmlFor="edu-field">
            <TextInput
              id="edu-field"
              name="field"
              value={educationForm.field}
              onChange={handleEducationChange}
            />
          </FormField>
          <div className={styles.formGrid}>
            <FormField label="Start Year" htmlFor="edu-start-year">
              <TextInput
                id="edu-start-year"
                name="startYear"
                value={educationForm.startYear}
                onChange={handleEducationChange}
              />
            </FormField>
            <FormField label="End Year" htmlFor="edu-end-year">
              <TextInput
                id="edu-end-year"
                name="endYear"
                value={educationForm.endYear}
                onChange={handleEducationChange}
              />
            </FormField>
          </div>
          <FormField label="Description" htmlFor="edu-description">
            <TextArea
              id="edu-description"
              name="description"
              value={educationForm.description}
              onChange={handleEducationChange}
              rows={4}
            />
          </FormField>
        </>
      );
    }

    if (modalType === 'certificates') {
      return (
        <>
          <FormField
            label="Certificate Name"
            htmlFor="cert-name"
            error={errors.name}
            required
          >
            <TextInput
              id="cert-name"
              name="name"
              value={certificateForm.name}
              onChange={handleCertificateChange}
              error={errors.name}
            />
          </FormField>
          <FormField
            label="Issuer"
            htmlFor="cert-issuer"
            error={errors.issuer}
            required
          >
            <TextInput
              id="cert-issuer"
              name="issuer"
              value={certificateForm.issuer}
              onChange={handleCertificateChange}
              error={errors.issuer}
            />
          </FormField>
          <div className={styles.formGrid}>
            <FormField label="Year" htmlFor="cert-year">
              <TextInput
                id="cert-year"
                name="year"
                value={certificateForm.year}
                onChange={handleCertificateChange}
              />
            </FormField>
            <FormField
              label="Credential URL"
              htmlFor="cert-url"
              error={errors.url}
            >
              <TextInput
                id="cert-url"
                name="url"
                value={certificateForm.url}
                onChange={handleCertificateChange}
                error={errors.url}
              />
            </FormField>
          </div>
        </>
      );
    }

    return (
      <>
        <FormField
          label="Title"
          htmlFor="ach-title"
          error={errors.title}
          required
        >
          <TextInput
            id="ach-title"
            name="title"
            value={achievementForm.title}
            onChange={handleAchievementChange}
            error={errors.title}
          />
        </FormField>
        <FormField label="Organization" htmlFor="ach-org">
          <TextInput
            id="ach-org"
            name="organization"
            value={achievementForm.organization}
            onChange={handleAchievementChange}
          />
        </FormField>
        <FormField label="Year" htmlFor="ach-year">
          <TextInput
            id="ach-year"
            name="year"
            value={achievementForm.year}
            onChange={handleAchievementChange}
          />
        </FormField>
        <FormField label="Description" htmlFor="ach-description">
          <TextArea
            id="ach-description"
            name="description"
            value={achievementForm.description}
            onChange={handleAchievementChange}
            rows={4}
          />
        </FormField>
      </>
    );
  };

  const modalTitles = {
    education: 'Education',
    certificates: 'Certificate',
    achievements: 'Achievement',
  };

  const tabLabels = [
    { value: 'education', label: 'Education' },
    { value: 'certificates', label: 'Certificates' },
    { value: 'achievements', label: 'Achievements' },
  ];

  return (
    <div className={styles.page}>
      <Breadcrumb items={[{ label: 'Education' }]} />

      <div className={styles.header}>
        <h2 className={styles.heading}>Education</h2>
        <Button onClick={openCreate}>+ New Entry</Button>
      </div>

      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Education sections"
      >
        {tabLabels.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.value}
            className={`${styles.tab} ${activeTab === tab.value ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderTabContent()}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${editingId ? 'Edit' : 'New'} ${modalTitles[modalType] || 'Entry'}`}
      >
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {renderModalForm()}
          <div className={styles.formActions}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingId ? 'Save Changes' : 'Create Entry'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Entry"
        message="Are you sure you want to delete this entry? This action cannot be undone."
        confirmLabel="Delete Entry"
      />
    </div>
  );
}

export default EducationPage;
