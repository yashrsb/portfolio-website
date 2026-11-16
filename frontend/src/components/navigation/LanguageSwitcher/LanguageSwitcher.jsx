import { useTranslation } from 'react-i18next';
import styles from './LanguageSwitcher.module.css';

const LANGUAGES = [
  { code: 'en', labelKey: 'nav.english', short: 'EN' },
  { code: 'hi', labelKey: 'nav.hindi', short: 'हिं' },
];

function LanguageSwitcher({ className = '', onChange }) {
  const { t, i18n } = useTranslation();
  const current = i18n.resolvedLanguage || i18n.language || 'en';

  const handleChange = (code) => {
    if (code === current) return;
    i18n.changeLanguage(code);
    onChange?.(code);
  };

  return (
    <div
      className={`${styles.switcher} ${className}`.trim()}
      role="group"
      aria-label={t('nav.selectLanguage')}
    >
      {LANGUAGES.map((lang) => {
        const active =
          current === lang.code || (current.startsWith('hi') && lang.code === 'hi');
        return (
          <button
            key={lang.code}
            type="button"
            className={`${styles.button} ${active ? styles.active : ''}`.trim()}
            onClick={() => handleChange(lang.code)}
            aria-pressed={active}
            aria-label={`${t('nav.language')}: ${t(lang.labelKey)}`}
            lang={lang.code}
          >
            {lang.short}
          </button>
        );
      })}
    </div>
  );
}

export default LanguageSwitcher;
