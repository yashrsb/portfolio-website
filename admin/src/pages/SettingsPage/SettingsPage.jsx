import Breadcrumb from '../../components/layout/Breadcrumb/Breadcrumb';
import styles from './SettingsPage.module.css';

const SETTINGS_SECTIONS = [
  {
    key: 'theme',
    title: 'Theme',
    description:
      'Light/dark mode preference, accent color, and interface density options will be configurable here.',
    icon: '🎨',
  },
  {
    key: 'account',
    title: 'Account',
    description:
      'Profile details, email preferences, and security settings will be managed here.',
    icon: '👤',
  },
  {
    key: 'notifications',
    title: 'Notifications',
    description:
      'Email and in-app notification preferences for new messages and activity alerts.',
    icon: '🔔',
  },
  {
    key: 'api',
    title: 'API',
    description:
      'API keys, integration endpoints, and webhook configuration will live here.',
    icon: '🔌',
  },
];

/**
 * SettingsPage — placeholder for future admin settings.
 */
function SettingsPage() {
  return (
    <div className={styles.page}>
      <Breadcrumb items={[{ label: 'Settings' }]} />

      <div className={styles.header}>
        <h2 className={styles.heading}>Settings</h2>
      </div>

      <div className={styles.grid}>
        {SETTINGS_SECTIONS.map((section) => (
          <section key={section.key} className={styles.card}>
            <span className={styles.icon} aria-hidden="true">
              {section.icon}
            </span>
            <h3 className={styles.cardTitle}>{section.title}</h3>
            <p className={styles.cardDescription}>{section.description}</p>
            <span className={styles.comingSoon}>Coming soon</span>
          </section>
        ))}
      </div>
    </div>
  );
}

export default SettingsPage;
