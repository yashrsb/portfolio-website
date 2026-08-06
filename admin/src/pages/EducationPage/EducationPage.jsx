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
import TextArea from '../../components/form/TextArea/TextArea';
import { useResource } from '../../hooks/useResource';
import { useDirtyForm } from '../../hooks/useDirtyForm';
import {
  educationService,
  certificateService,
  achievementService,
} from '../../services';
import { isRequired, isUrl } from '../../utils/validation';
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

const TAB_LABELS = [
  { value: 'education', label: 'Education' },
  { value: 'certificates', label: 'Certificates' },
  { value: 'achievements', label: 'Achievements' },
];

const MODAL_TITLES = {
  education: 'Education',
  certificates: 'Certificate',
  achievements: 'Achievement',
};

/**
 * EducationPage — CRUD UI for education, certificates, and achievements,
 * each backed by its own service via useResource.
 */
function EducationPage() {
  const education = useResource(educationService);
  const certificates = useResource(certificateService);
  const achievements = useResource(achievementService);
  const { markDirty, resetDirty } = useDirtyForm();

  const [activeTab, setActiveTab] = useState('education');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [educationForm, setEducationForm] = useState(EMPTY_EDUCATION);
  const [certificateForm, setCertificateForm] = useState(EMPTY_CERTIFICATE);
  const [achievementForm, setAchievementForm] = useState(EMPTY_ACHIEVEMENT);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const activeResource =
    activeTab === 'education'
      ? education
      : activeTab === 'certificates'
        ? certificates
        : achievements;

  const openCreate = () => {
    setEditingId(null);
    setErrors({});
    setModalType(activeTab);
    if (activeTab === 'education') setEducationForm(EMPTY_EDUCATION);
    if (activeTab === 'certificates') setCertificateForm(EMPTY_CERTIFICATE);
    if (activeTab === 'achievements') setAchievementForm(EMPTY_ACHIEVEMENT);
    setModalOpen(true);
  };

  const openEdit = (resource, item) => {
    if (!item) return;
    setEditingId(item.id);
    setErrors({});
    setModalType(resource);

    if (resource === 'education') {
      setEducationForm({
        institution: item.institution,
        degree: item.degree,
        field: item.field,
        startYear: String(item.startYear),
        endYear: String(item.endYear),
        description: item.description,
      });
    } else if (resource === 'certificates') {
      setCertificateForm({
        name: item.name,
        issuer: item.issuer,
        year: String(item.year),
        url: item.url,
      });
    } else if (resource === 'achievements') {
      setAchievementForm({
        title: item.title,
        organization: item.organization,
        year: String(item.year),
        description: item.description,
      });
    }

    setModalOpen(true);
  };

  const handleChange = (setter) => (event) => {
    const { name, value } = event.target;
    setter((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    markDirty();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

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
      if (isRequired(certificateForm.year))
        validationErrors.year = 'Year is required';
      if (certificateForm.url && !isUrl(certificateForm.url))
        validationErrors.url = 'Enter a valid URL';
    } else if (modalType === 'achievements') {
      if (isRequired(achievementForm.title))
        validationErrors.title = 'Title is required';
      if (isRequired(achievementForm.organization))
        validationErrors.organization = 'Organization is required';
      if (isRequired(achievementForm.year))
        validationErrors.year = 'Year is required';
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    let payload;
    let result;
    if (modalType === 'education') {
      payload = {
        ...educationForm,
        startYear: Number(educationForm.startYear),
        endYear: Number(educationForm.endYear),
      };
      result = editingId
        ? await education.update(editingId, payload)
        : await education.create(payload);
    } else if (modalType === 'certificates') {
      payload = {
        ...certificateForm,
        year: String(certificateForm.year),
      };
      result = editingId
        ? await certificates.update(editingId, payload)
        : await certificates.create(payload);
    } else {
      payload = {
        ...achievementForm,
        year: Number(achievementForm.year),
      };
      result = editingId
        ? await achievements.update(editingId, payload)
        : await achievements.create(payload);
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
    const { resource, id } = deleteTarget;
    const ok =
      resource === 'education'
        ? await education.remove(id)
        : resource === 'certificates'
          ? await certificates.remove(id)
          : await achievements.remove(id);
    setDeleting(false);
    if (ok) setDeleteTarget(null);
  };

  const deleteColumns = [
    {
      key: 'actions',
      label: 'Actions',
      type: 'action',
      render: (row) => {
        const label = row.title || row.name || row.institution;
        return (
          <div className={styles.actions}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEdit(activeTab, row)}
              ariaLabel={`Edit ${label}`}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setDeleteTarget({ resource: activeTab, id: row.id })
              }
              ariaLabel={`Delete ${label}`}
            >
              Delete
            </Button>
          </div>
        );
      },
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
          rows={education.data}
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
          rows={certificates.data}
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
        rows={achievements.data}
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
              onChange={handleChange(setEducationForm)}
              error={errors.institution}
              disabled={submitting}
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
              onChange={handleChange(setEducationForm)}
              error={errors.degree}
              disabled={submitting}
            />
          </FormField>
          <FormField label="Field of Study" htmlFor="edu-field">
            <TextInput
              id="edu-field"
              name="field"
              value={educationForm.field}
              onChange={handleChange(setEducationForm)}
              disabled={submitting}
            />
          </FormField>
          <div className={styles.formGrid}>
            <FormField label="Start Year" htmlFor="edu-start-year">
              <TextInput
                id="edu-start-year"
                name="startYear"
                value={educationForm.startYear}
                onChange={handleChange(setEducationForm)}
                disabled={submitting}
              />
            </FormField>
            <FormField label="End Year" htmlFor="edu-end-year">
              <TextInput
                id="edu-end-year"
                name="endYear"
                value={educationForm.endYear}
                onChange={handleChange(setEducationForm)}
                disabled={submitting}
              />
            </FormField>
          </div>
          <FormField label="Description" htmlFor="edu-description">
            <TextArea
              id="edu-description"
              name="description"
              value={educationForm.description}
              onChange={handleChange(setEducationForm)}
              rows={4}
              disabled={submitting}
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
              onChange={handleChange(setCertificateForm)}
              error={errors.name}
              disabled={submitting}
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
              onChange={handleChange(setCertificateForm)}
              error={errors.issuer}
              disabled={submitting}
            />
          </FormField>
          <div className={styles.formGrid}>
            <FormField
              label="Year"
              htmlFor="cert-year"
              error={errors.year}
              required
            >
              <TextInput
                id="cert-year"
                name="year"
                value={certificateForm.year}
                onChange={handleChange(setCertificateForm)}
                error={errors.year}
                disabled={submitting}
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
                onChange={handleChange(setCertificateForm)}
                error={errors.url}
                disabled={submitting}
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
            onChange={handleChange(setAchievementForm)}
            error={errors.title}
            disabled={submitting}
          />
        </FormField>
        <FormField
          label="Organization"
          htmlFor="ach-org"
          error={errors.organization}
          required
        >
          <TextInput
            id="ach-org"
            name="organization"
            value={achievementForm.organization}
            onChange={handleChange(setAchievementForm)}
            error={errors.organization}
            disabled={submitting}
          />
        </FormField>
        <FormField label="Year" htmlFor="ach-year" error={errors.year} required>
          <TextInput
            id="ach-year"
            name="year"
            value={achievementForm.year}
            onChange={handleChange(setAchievementForm)}
            error={errors.year}
            disabled={submitting}
          />
        </FormField>
        <FormField label="Description" htmlFor="ach-description">
          <TextArea
            id="ach-description"
            name="description"
            value={achievementForm.description}
            onChange={handleChange(setAchievementForm)}
            rows={4}
            disabled={submitting}
          />
        </FormField>
      </>
    );
  };

  return (
    <div className={styles.page}>
      <Breadcrumb items={[{ label: 'Education' }]} />

      <div className={styles.header}>
        <h2 className={styles.heading}>Education</h2>
        <div className={styles.actions}>
          <Button variant="outline" size="sm" onClick={activeResource.refresh}>
            Refresh
          </Button>
          <Button onClick={openCreate}>+ New Entry</Button>
        </div>
      </div>

      {activeResource.error && (
        <ApiErrorBanner
          error={activeResource.error}
          onRetry={() => {
            if (activeResource.error.isNetworkError) {
              activeResource.refresh();
            } else {
              activeResource.clearError();
            }
          }}
        />
      )}

      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Education sections"
      >
        {TAB_LABELS.map((tab) => (
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

      {activeResource.loading ? (
        <SkeletonTable rows={4} columns={6} />
      ) : (
        renderTabContent()
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${editingId ? 'Edit' : 'New'} ${MODAL_TITLES[modalType] || 'Entry'}`}
      >
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {renderModalForm()}
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
