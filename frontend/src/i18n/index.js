import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en/translation.json';
import hi from './locales/hi/translation.json';

export const LANGUAGE_STORAGE_KEY = 'portfolio-language';
export const SUPPORTED_LANGUAGES = ['en', 'hi'];
export const DEFAULT_LANGUAGE = 'en';

function getInitialLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) return saved;
  } catch {
    /* ignore */
  }
  const browser = (navigator.language || navigator.userLanguage || '').toLowerCase();
  if (browser.startsWith('hi')) return 'hi';
  if (browser.startsWith('en')) return 'en';
  return DEFAULT_LANGUAGE;
}

export function setDocumentLanguage(lng) {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng || DEFAULT_LANGUAGE;
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },
  lng: getInitialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
  returnEmptyString: false,
});

setDocumentLanguage(i18n.language);

i18n.on('languageChanged', (lng) => {
  const normalized = SUPPORTED_LANGUAGES.includes(lng) ? lng : DEFAULT_LANGUAGE;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
  } catch {
    /* ignore */
  }
  setDocumentLanguage(normalized);
});

export default i18n;
