import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ThemeSelector from './ThemeSelector';

describe('ThemeSelector', () => {
  const onPreferenceChange = vi.fn();

  beforeEach(() => {
    onPreferenceChange.mockClear();
  });

  it('renders all three options', () => {
    render(
      <ThemeSelector preference="system" onPreferenceChange={onPreferenceChange} />,
    );

    expect(screen.getByRole('radio', { name: /Light mode/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Dark mode/ })).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: /System.*follow OS/ }),
    ).toBeInTheDocument();
  });

  it('marks the active option as checked', () => {
    render(
      <ThemeSelector preference="dark" onPreferenceChange={onPreferenceChange} />,
    );

    expect(screen.getByRole('radio', { name: /Dark mode/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(
      screen.getByRole('radio', { name: /Light mode/ }),
    ).toHaveAttribute('aria-checked', 'false');
    expect(
      screen.getByRole('radio', { name: /System.*follow OS/ }),
    ).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onPreferenceChange when an option is clicked', () => {
    render(
      <ThemeSelector preference="light" onPreferenceChange={onPreferenceChange} />,
    );

    fireEvent.click(screen.getByRole('radio', { name: /Dark mode/ }));
    expect(onPreferenceChange).toHaveBeenCalledWith('dark');

    fireEvent.click(screen.getByRole('radio', { name: /System.*follow OS/ }));
    expect(onPreferenceChange).toHaveBeenCalledWith('system');
  });

  it('has an accessible group label', () => {
    render(
      <ThemeSelector preference="system" onPreferenceChange={onPreferenceChange} />,
    );

    expect(
      screen.getByRole('group', { name: 'Theme preference' }),
    ).toBeInTheDocument();
  });
});