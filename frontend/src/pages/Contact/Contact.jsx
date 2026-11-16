import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/common/Container/Container';
import Heading from '../../components/common/Heading/Heading';
import Card from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import Reveal from '../../components/common/Reveal/Reveal';
import LoadingState from '../../components/common/LoadingState/LoadingState';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import SocialIcon from '../../components/footer/SocialIcon/SocialIcon';
import { useProfile, useSocial } from '../../hooks';
import { setPageSEO } from '../../utils/seo';
import { submitContact } from '../../services';
import { ApiError } from '../../services/apiClient';
import styles from './Contact.module.css';

const EMPTY_FORM = {
  name: '',
  email: '',
  subject: '',
  message: '',
  website: '',
};

const FORM_STATES = {
  IDLE: 'idle',
  SUBMITTING: 'submitting',
  SUCCESS: 'success',
  VALIDATION_ERROR: 'validation_error',
  SERVER_ERROR: 'server_error',
  NETWORK_ERROR: 'network_error',
  SPAM_REJECTED: 'spam_rejected',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_NAME_LENGTH = 100;
const MAX_SUBJECT_LENGTH = 150;
const MAX_MESSAGE_LENGTH = 2000;

function Contact() {
  const { t, i18n } = useTranslation();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useProfile();
  const {
    socialLinks,
    loading: socialLoading,
    error: socialError,
  } = useSocial();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formState, setFormState] = useState(FORM_STATES.IDLE);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const validateForm = (formData) => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = t('contact.validation.nameRequired');
    } else if (formData.name.trim().length < 2) {
      errors.name = t('contact.validation.nameMin');
    } else if (formData.name.length > MAX_NAME_LENGTH) {
      errors.name = t('contact.validation.nameMax', { max: MAX_NAME_LENGTH });
    }
    if (!formData.email.trim()) {
      errors.email = t('contact.validation.emailRequired');
    } else if (!EMAIL_REGEX.test(formData.email)) {
      errors.email = t('contact.validation.emailInvalid');
    }
    if (!formData.subject.trim()) {
      errors.subject = t('contact.validation.subjectRequired');
    } else if (formData.subject.trim().length < 5) {
      errors.subject = t('contact.validation.subjectMin');
    } else if (formData.subject.length > MAX_SUBJECT_LENGTH) {
      errors.subject = t('contact.validation.subjectMax', {
        max: MAX_SUBJECT_LENGTH,
      });
    }
    if (!formData.message.trim()) {
      errors.message = t('contact.validation.messageRequired');
    } else if (formData.message.trim().length < 10) {
      errors.message = t('contact.validation.messageMin');
    } else if (formData.message.length > MAX_MESSAGE_LENGTH) {
      errors.message = t('contact.validation.messageMax', {
        max: MAX_MESSAGE_LENGTH,
      });
    }
    return errors;
  };

  const mapErrorToState = (error) => {
    if (error instanceof ApiError && error.status === 0) {
      return FORM_STATES.NETWORK_ERROR;
    }
    if (error instanceof ApiError && error.details) {
      const code = error.details.code;
      if (code === 'SPAM_REJECTED') {
        return FORM_STATES.SPAM_REJECTED;
      }
      if (code === 'RATE_LIMIT_EXCEEDED') {
        return FORM_STATES.SERVER_ERROR;
      }
      if (code === 'VALIDATION_ERROR') {
        return FORM_STATES.VALIDATION_ERROR;
      }
    }
    return FORM_STATES.SERVER_ERROR;
  };

  const extractFieldErrors = (error) => {
    if (
      error instanceof ApiError &&
      error.status === 400 &&
      Array.isArray(error.details?.errors)
    ) {
      return error.details.errors.reduce((acc, fieldError) => {
        acc[fieldError.field] = fieldError.message;
        return acc;
      }, {});
    }
    return {};
  };

  useEffect(() => {
    setPageSEO({
      title: t('contact.title'),
      description: t('contact.seoDescription'),
      path: '/contact',
    });
  }, [t, i18n.language]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (formState !== FORM_STATES.IDLE) {
      setFormState(FORM_STATES.IDLE);
      setServerError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formState === FORM_STATES.SUBMITTING) return;

    const errors = validateForm(formData);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setFormState(FORM_STATES.VALIDATION_ERROR);
      setServerError(t('contact.validation.fixErrors'));
      return;
    }

    setFormState(FORM_STATES.SUBMITTING);
    setServerError('');

    try {
      await submitContact(formData);
      setFormData(EMPTY_FORM);
      setFormState(FORM_STATES.SUCCESS);
      setFieldErrors({});
      setServerError('');
    } catch (err) {
      const state = mapErrorToState(err);
      setFormState(state);

      if (state === FORM_STATES.VALIDATION_ERROR) {
        setFieldErrors(extractFieldErrors(err));
        setServerError(t('contact.validation.fixErrors'));
      } else if (state === FORM_STATES.NETWORK_ERROR) {
        setServerError(t('contact.messages.networkError'));
      } else if (state === FORM_STATES.SPAM_REJECTED) {
        setServerError(t('contact.messages.spamRejected'));
      } else {
        setServerError(t('contact.messages.serverError'));
      }
    }
  };

  if (profileLoading || socialLoading) {
    return <LoadingState label={t('contact.loading')} />;
  }

  const error = profileError || socialError;
  if (error) {
    return <ErrorState title={t('contact.failed')} message={error} />;
  }

  const contact = profile?.contact || {};
  const social = {};
  for (const link of socialLinks || []) {
    social[link.platform] = link.url;
  }

  const contactItems = [
    {
      label: t('contact.labels.email'),
      value: contact.email,
      href: contact.email ? `mailto:${contact.email}` : undefined,
      platform: 'email',
    },
    {
      label: t('contact.labels.linkedin'),
      value: t('contact.values.linkedinProfile'),
      href: social.linkedin || contact.linkedin,
      platform: 'linkedin',
    },
    {
      label: t('contact.labels.github'),
      value: t('contact.values.githubProfile'),
      href: social.github || contact.github,
      platform: 'github',
    },
    {
      label: t('contact.labels.location'),
      value: contact.location,
      platform: 'location',
    },
  ].filter((item) => item.value);

  const isSubmitting = formState === FORM_STATES.SUBMITTING;
  const inputDisabled = isSubmitting;
  const hasError = [
    FORM_STATES.VALIDATION_ERROR,
    FORM_STATES.SERVER_ERROR,
    FORM_STATES.NETWORK_ERROR,
    FORM_STATES.SPAM_REJECTED,
  ].includes(formState);

  return (
    <Container size="md">
      <Heading level={1} alignment="center">
        {t('contact.title')}
      </Heading>

      <div className={styles.grid}>
        <Reveal>
          <div className={styles.info}>
            <h2 className={styles.sectionTitle}>{t('contact.getInTouch')}</h2>
            <div className={styles.contactCards}>
              {contactItems.map((item) => (
                <Card
                  key={item.label}
                  className={styles.contactCard}
                  padding="md"
                  shadow="sm"
                  hoverable
                >
                  <div className={styles.contactCardInner}>
                    <div className={styles.contactCardIcon} aria-hidden="true">
                      <SocialIcon platform={item.platform} size={24} />
                    </div>
                    <div className={styles.contactCardContent}>
                      <span className={styles.contactCardLabel}>{item.label}</span>
                      {item.href ? (
                        <a
                          href={item.href}
                          className={styles.contactCardValue}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <span className={styles.contactCardValue}>{item.value}</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <Card className={styles.formCard}>
            {formState === FORM_STATES.SUCCESS ? (
              <div
                className={styles.successState}
                role="status"
                aria-live="polite"
              >
                <div className={styles.successIcon} aria-hidden="true">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <p className={styles.successTitle}>
                  {t('contact.messages.successTitle')}
                </p>
                <p className={styles.successText}>
                  {t('contact.messages.successText')}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData(EMPTY_FORM);
                    setFormState(FORM_STATES.IDLE);
                  }}
                >
                  {t('contact.messages.sendAnother')}
                </Button>
              </div>
            ) : (
              <div className={styles.formWrapper}>
                <div className={styles.formHeader}>
                  <h2 className={styles.formTitle}>{t('contact.getInTouch')}</h2>
                  <p className={styles.formSubtitle}>
                    {t('contact.messages.successText').split('.')[0]
                      ? t('contact.getInTouch')
                      : t('contact.getInTouch')}
                  </p>
                </div>
                <form onSubmit={handleSubmit} className={styles.form} noValidate>
                  <input
                    type="text"
                    name="website"
                    className={styles.honeypot}
                    tabIndex={-1}
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    aria-hidden="true"
                    value={formData.website}
                    onChange={handleChange}
                  />

                  <div className={styles.field}>
                    <label htmlFor="name" className={styles.fieldLabel}>
                      {t('contact.labels.name')}
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className={`${styles.input} ${
                        fieldErrors.name ? styles.inputError : ''
                      }`}
                      value={formData.name}
                      onChange={handleChange}
                      required
                      maxLength={MAX_NAME_LENGTH}
                      autoComplete="name"
                      disabled={inputDisabled}
                      aria-invalid={Boolean(fieldErrors.name)}
                      aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                    />
                    {fieldErrors.name && (
                      <p id="name-error" className={styles.fieldError} role="alert">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="email" className={styles.fieldLabel}>
                      {t('contact.labels.emailField')}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={`${styles.input} ${
                        fieldErrors.email ? styles.inputError : ''
                      }`}
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      disabled={inputDisabled}
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={
                        fieldErrors.email ? 'email-error' : undefined
                      }
                    />
                    {fieldErrors.email && (
                      <p id="email-error" className={styles.fieldError} role="alert">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="subject" className={styles.fieldLabel}>
                      {t('contact.labels.subject')}
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      className={`${styles.input} ${
                        fieldErrors.subject ? styles.inputError : ''
                      }`}
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      maxLength={MAX_SUBJECT_LENGTH}
                      autoComplete="off"
                      disabled={inputDisabled}
                      aria-invalid={Boolean(fieldErrors.subject)}
                      aria-describedby={
                        fieldErrors.subject ? 'subject-error' : undefined
                      }
                    />
                    {fieldErrors.subject && (
                      <p id="subject-error" className={styles.fieldError} role="alert">
                        {fieldErrors.subject}
                      </p>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="message" className={styles.fieldLabel}>
                      {t('contact.labels.message')}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      className={`${styles.textarea} ${
                        fieldErrors.message ? styles.textareaError : ''
                      }`}
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      maxLength={MAX_MESSAGE_LENGTH}
                      disabled={inputDisabled}
                      aria-invalid={Boolean(fieldErrors.message)}
                      aria-describedby={
                        fieldErrors.message ? 'message-error' : undefined
                      }
                    />
                    {fieldErrors.message && (
                      <p id="message-error" className={styles.fieldError} role="alert">
                        {fieldErrors.message}
                      </p>
                    )}
                  </div>

                  {serverError && (
                    <p className={styles.errorSummary} role="alert">
                      {serverError}
                    </p>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className={styles.submit}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? t('contact.submit.sending') : t('contact.submit.send')}
                    {!isSubmitting && (
                      <svg
                        className={styles.arrow}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    )}
                  </Button>

                  <div aria-live={hasError ? 'assertive' : 'off'} aria-atomic="true" />
                </form>
              </div>
            )}
          </Card>
        </Reveal>
      </div>
    </Container>
  );
}

export default Contact;
