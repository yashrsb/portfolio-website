import { useState, useEffect } from 'react';
import Container from '../../components/common/Container/Container';
import Heading from '../../components/common/Heading/Heading';
import Card from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import Reveal from '../../components/common/Reveal/Reveal';
import LoadingState from '../../components/common/LoadingState/LoadingState';
import ErrorState from '../../components/common/ErrorState/ErrorState';
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

/**
 * Validates the contact form fields client-side.
 * Mirrors the backend validator rules so users get instant feedback.
 * @param {object} formData - Form field values.
 * @returns {object} Map of field name to error message.
 */
const validateForm = (formData) => {
  const errors = {};

  if (!formData.name.trim()) {
    errors.name = 'Name is required';
  } else if (formData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (formData.name.length > MAX_NAME_LENGTH) {
    errors.name = `Name must be at most ${MAX_NAME_LENGTH} characters`;
  }

  if (!formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(formData.email)) {
    errors.email = 'A valid email address is required';
  }

  if (!formData.subject.trim()) {
    errors.subject = 'Subject is required';
  } else if (formData.subject.trim().length < 5) {
    errors.subject = 'Subject must be at least 5 characters';
  } else if (formData.subject.length > MAX_SUBJECT_LENGTH) {
    errors.subject = `Subject must be at most ${MAX_SUBJECT_LENGTH} characters`;
  }

  if (!formData.message.trim()) {
    errors.message = 'Message is required';
  } else if (formData.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters';
  } else if (formData.message.length > MAX_MESSAGE_LENGTH) {
    errors.message = `Message must be at most ${MAX_MESSAGE_LENGTH} characters`;
  }

  return errors;
};

/**
 * Maps an API error to a form state.
 * @param {ApiError|Error} error - The caught error.
 * @returns {string} One of the FORM_STATES values.
 */
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

/**
 * Extracts server-side field errors from an API validation error.
 * @param {ApiError|Error} error - The caught error.
 * @returns {object} Map of field name to error message.
 */
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

/**
 * Contact page — contact details and a contact form backed by the API.
 * Contact info comes from the profile record; social links come from
 * the social links resource.
 */
function Contact() {
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

  useEffect(() => {
    setPageSEO({
      title: 'Contact',
      description: 'Get in touch via email, LinkedIn, or GitHub.',
      path: '/contact',
    });
  }, []);

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
      setServerError('');
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
        setServerError('Please fix the errors below and try again.');
      } else if (state === FORM_STATES.NETWORK_ERROR) {
        setServerError(
          'Unable to reach the server. Please check your connection and try again.',
        );
      } else if (state === FORM_STATES.SPAM_REJECTED) {
        setServerError(
          'Your submission was flagged as spam. Please try again.',
        );
      } else {
        setServerError(
          'Something went wrong. Your message could not be sent. Please try again later.',
        );
      }
    }
  };

  if (profileLoading || socialLoading) {
    return <LoadingState label="Loading contact details..." />;
  }

  const error = profileError || socialError;
  if (error) {
    return (
      <ErrorState title="Failed to load contact details" message={error} />
    );
  }

  const contact = profile?.contact || {};
  const social = {};
  for (const link of socialLinks || []) {
    social[link.platform] = link.url;
  }

  const contactItems = [
    { label: 'Email', value: contact.email, href: `mailto:${contact.email}` },
    {
      label: 'LinkedIn',
      value: 'LinkedIn Profile',
      href: social.linkedin || contact.linkedin,
    },
    {
      label: 'GitHub',
      value: 'GitHub Profile',
      href: social.github || contact.github,
    },
    { label: 'Location', value: contact.location },
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
        Contact
      </Heading>

      <div className={styles.grid}>
        <Reveal>
          <div className={styles.info}>
            <h2 className={styles.sectionTitle}>Get in Touch</h2>
            <ul className={styles.list}>
              {contactItems.map((item) => (
                <li key={item.label} className={styles.listItem}>
                  <span className={styles.label}>{item.label}</span>
                  {item.href ? (
                    <a
                      href={item.href}
                      className={styles.value}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span className={styles.value}>{item.value}</span>
                  )}
                </li>
              ))}
            </ul>
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
                <span className={styles.successIcon} aria-hidden="true">
                  ✓
                </span>
                <p className={styles.successTitle}>Message Sent</p>
                <p className={styles.successText}>
                  Thank you for reaching out. I&apos;ll get back to you as soon
                  as possible.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData(EMPTY_FORM);
                    setFormState(FORM_STATES.IDLE);
                  }}
                >
                  Send another message
                </Button>
              </div>
            ) : (
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
                    Name
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
                    aria-describedby={
                      fieldErrors.name ? 'name-error' : undefined
                    }
                  />
                  {fieldErrors.name && (
                    <p
                      id="name-error"
                      className={styles.fieldError}
                      role="alert"
                    >
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="email" className={styles.fieldLabel}>
                    Email
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
                    <p
                      id="email-error"
                      className={styles.fieldError}
                      role="alert"
                    >
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="subject" className={styles.fieldLabel}>
                    Subject
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
                    <p
                      id="subject-error"
                      className={styles.fieldError}
                      role="alert"
                    >
                      {fieldErrors.subject}
                    </p>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="message" className={styles.fieldLabel}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    className={`${styles.textarea} ${
                      fieldErrors.message ? styles.textareaError : ''
                    }`}
                    rows={5}
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
                    <p
                      id="message-error"
                      className={styles.fieldError}
                      role="alert"
                    >
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
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>

                <div
                  aria-live={hasError ? 'assertive' : 'off'}
                  aria-atomic="true"
                />
              </form>
            )}
          </Card>
        </Reveal>
      </div>
    </Container>
  );
}

export default Contact;
