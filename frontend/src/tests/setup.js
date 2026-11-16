import '@testing-library/jest-dom';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../i18n/locales/en/translation.json';
import hi from '../i18n/locales/hi/translation.json';

// Initialize i18n for tests with English as default
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi'],
    interpolation: { escapeValue: false },
    returnNull: false,
    returnEmptyString: false,
  });
} else {
  i18n.changeLanguage('en');
}
