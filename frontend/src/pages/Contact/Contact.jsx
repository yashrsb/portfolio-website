import { useState, useEffect } from 'react';
import Container from '../../components/common/Container/Container';
import Heading from '../../components/common/Heading/Heading';
import Card from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import Reveal from '../../components/common/Reveal/Reveal';
import { social } from '../../data';
import styles from './Contact.module.css';

/**
 * Contact page — contact details and a frontend-only form.
 * Sections fade in when they enter the viewport.
 */
function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'Contact — Alex Chen';
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const contactItems = [
    { label: 'Email', value: social.email, href: `mailto:${social.email}` },
    { label: 'LinkedIn', value: 'LinkedIn Profile', href: social.linkedin },
    { label: 'GitHub', value: 'GitHub Profile', href: social.github },
    { label: 'Location', value: social.location },
    { label: 'Phone', value: social.phone },
  ];

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
                <p className={styles.comingSoonTitle}>Coming Soon</p>
                <p className={styles.comingSoonText}>
                  The contact form will be available in a future phase. Please
                  reach out via email or social channels.
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
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className={styles.submit}
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

