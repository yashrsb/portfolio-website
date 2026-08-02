import { useState, useEffect } from 'react';
import Container from '../../components/common/Container/Container';
import Heading from '../../components/common/Heading/Heading';
import Card from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import Reveal from '../../components/common/Reveal/Reveal';
import LoadingState from '../../components/common/LoadingState/LoadingState';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import { useProfile, useSocial } from '../../hooks';
import { submitContact } from '../../services';
import styles from './Contact.module.css';

const EMPTY_FORM = {
  name: '',
  email: '',
  subject: '',
  message: '',
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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'Contact — Portfolio';
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSubmitError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      await submitContact(formData);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || 'Failed to send your message.');
    } finally {
      setSubmitting(false);
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
  // Build a platform -> URL lookup from the SocialLink records.
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
            {submitted ? (
              <div className={styles.comingSoon} role="status">
                <p className={styles.comingSoonTitle}>Message Sent</p>
                <p className={styles.comingSoonText}>
                  Thank you for reaching out. I&apos;ll get back to you as soon
                  as possible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form} noValidate>
                <div className={styles.field}>
                  <label htmlFor="name" className={styles.fieldLabel}>
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className={styles.input}
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="email" className={styles.fieldLabel}>
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={styles.input}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="subject" className={styles.fieldLabel}>
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    className={styles.input}
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="message" className={styles.fieldLabel}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    className={styles.textarea}
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                {submitError && (
                  <p className={styles.submitError} role="alert">
                    {submitError}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className={styles.submit}
                  loading={submitting}
                >
                  Send Message
                </Button>
              </form>
            )}
          </Card>
        </Reveal>
      </div>
    </Container>
  );
}

export default Contact;
