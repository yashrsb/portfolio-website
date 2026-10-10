/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

/**
 * @typedef {'light' | 'dark' | 'system'} ThemePreference
 * @typedef {'light' | 'dark'} Theme
 */

/**
 * @type {React.Context<{
 *   theme: Theme;
 *   resolvedTheme: Theme;
 *   preference: ThemePreference;
 *   setPreference: (pref: ThemePreference) => void;
 *   toggleTheme: () => void;
 * }>}
 */
const ThemeContext = createContext(undefined);

const STORAGE_KEY = 'portfolio-theme-preference';

/**
 * Safely read a value from localStorage.
 * @returns {string | null}
 */
function readStorage() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Safely write a value to localStorage.
 * @param {string} value
 */
function writeStorage(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* ignore */
  }
}

/**
 * Resolve the active visual theme from a preference and the OS setting.
 * @param {ThemePreference} preference
 * @returns {Theme}
 */
function resolveTheme(preference) {
  if (preference === 'light' || preference === 'dark') {
    return preference;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * ThemeProvider — manages light/dark/system theme modes.
 * Persists the user's preference in localStorage.
 * Resolves system mode using prefers-color-scheme.
 */
export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(() => {
    const stored = readStorage();
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return 'system';
  });

  const [theme, setTheme] = useState(() => resolveTheme(preference));

  // Keep resolved theme in sync when preference or OS setting changes.
  useEffect(() => {
    setTheme(resolveTheme(preference));
  }, [preference]);

  // Persist preference.
  useEffect(() => {
    writeStorage(preference);
  }, [preference]);

  // Apply theme to DOM and update color-scheme.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  // Listen for OS theme changes when preference is 'system'.
  useEffect(() => {
    if (preference !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [preference]);

  const setPreferenceAndTheme = useCallback((pref) => {
    setPreference(pref);
    setTheme(resolveTheme(pref));
  }, []);

  const toggleTheme = useCallback(() => {
    setPreferenceAndTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setPreferenceAndTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme: theme,
      preference,
      setPreference: setPreferenceAndTheme,
      toggleTheme,
    }),
    [theme, preference, setPreferenceAndTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Hook to access current theme, preference, and setter.
 * Must be used within a ThemeProvider.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}