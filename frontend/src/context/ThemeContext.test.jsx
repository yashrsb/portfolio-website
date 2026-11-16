import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeContext';

const mockMatchMedia = (matches) => ({
  matches,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

function renderWithProvider() {
  let theme;
  function Consumer() {
    theme = useTheme();
    return <div />;
  }
  render(
    <ThemeProvider>
      <Consumer />
    </ThemeProvider>,
  );
  return {
    getTheme: () => theme,
    rerender: () => {
      render(
        <ThemeProvider>
          <Consumer />
        </ThemeProvider>,
      );
    },
  };
}

describe('ThemeContext', () => {
  let originalMatchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn(() => mockMatchMedia(false));
    localStorage.clear();
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('throws when useTheme is used outside ThemeProvider', () => {
    expect(() => render(<TestComponent />)).toThrow(
      'useTheme must be used within a ThemeProvider',
    );
  });

  it('provides default theme, preference, setPreference, and toggleTheme', () => {
    const { getTheme } = renderWithProvider();
    const theme = getTheme();
    expect(theme.theme).toBe('light');
    expect(theme.preference).toBe('system');
    expect(theme.resolvedTheme).toBe('light');
    expect(typeof theme.setPreference).toBe('function');
    expect(typeof theme.toggleTheme).toBe('function');
  });

  it('resolves dark theme when system preference is dark', () => {
    window.matchMedia = vi.fn(() => mockMatchMedia(true));
    const { getTheme } = renderWithProvider();
    const theme = getTheme();
    expect(theme.theme).toBe('dark');
    expect(theme.resolvedTheme).toBe('dark');
    expect(theme.preference).toBe('system');
  });

  it('persists preference to localStorage', () => {
    const { getTheme } = renderWithProvider();
    act(() => getTheme().setPreference('dark'));
    expect(localStorage.getItem('portfolio-theme-preference')).toBe('dark');
    expect(getTheme().preference).toBe('dark');
    expect(getTheme().theme).toBe('dark');
  });

  it('falls back to system when stored value is invalid', () => {
    localStorage.setItem('portfolio-theme-preference', 'invalid');
    const { getTheme } = renderWithProvider();
    expect(getTheme().preference).toBe('system');
  });

  it('falls back safely when localStorage access throws', () => {
    const throwSpy = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('blocked');
      });
    const { getTheme } = renderWithProvider();
    expect(getTheme().preference).toBe('system');
    throwSpy.mockRestore();
  });

  it('toggleTheme switches between light and dark', () => {
    const { getTheme } = renderWithProvider();
    act(() => getTheme().setPreference('light'));
    expect(getTheme().theme).toBe('light');

    act(() => getTheme().toggleTheme());
    expect(getTheme().theme).toBe('dark');
    expect(getTheme().preference).toBe('dark');

    act(() => getTheme().toggleTheme());
    expect(getTheme().theme).toBe('light');
    expect(getTheme().preference).toBe('light');
  });

  it('applies data-theme attribute to documentElement', () => {
    renderWithProvider();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});

function TestComponent() {
  useTheme();
  return null;
}