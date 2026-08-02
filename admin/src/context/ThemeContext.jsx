/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

/**
 * @typedef {'light' | 'dark'} Theme
 */

/**
 * @type {React.Context<{ theme: Theme; toggleTheme: () => void }>}
 */
const ThemeContext = createContext(undefined);

/**
 * ThemeProvider — manages light/dark mode for the admin app.
 * Persists preference in localStorage under its own key so the
 * admin and public portfolio themes are independent.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('portfolio-admin-theme');
    if (stored === 'light' || stored === 'dark') return stored;

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-admin-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access the current admin theme and toggle function.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
