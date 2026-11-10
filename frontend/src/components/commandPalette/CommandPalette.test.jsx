import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CommandPalette from './CommandPalette';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

const setThemeMock = vi.fn();
vi.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', preference: 'system', setTheme: setThemeMock }),
}));

vi.mock('../../hooks', () => ({
  useProfile: () => ({
    profile: { resumeUrl: 'https://example.com/resume.pdf' },
    loading: false,
  }),
  useSocial: () => ({
    socialLinks: [{ id: 1, platform: 'github', url: 'https://github.com/yashrsb' }],
    loading: false,
  }),
}));

function renderPalette(props = {}) {
  const onClose = vi.fn();
  render(
    <MemoryRouter>
      <CommandPalette isOpen onClose={onClose} {...props} />
    </MemoryRouter>,
  );
  return { onClose };
}

describe('CommandPalette', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    setThemeMock.mockClear();
  });

  it('renders dialog, search, and command groups', () => {
    renderPalette();
    expect(screen.getByRole('dialog', { name: /command palette/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/search commands/i)).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: /commands/i })).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
  });

  it('filters commands and shows empty state', () => {
    renderPalette();
    fireEvent.change(screen.getByLabelText(/search commands/i), {
      target: { value: 'zzzz-no-match' },
    });
    expect(screen.getByText(/no commands match/i)).toBeInTheDocument();
  });

  it('supports keyboard navigation and executes on Enter', async () => {
    const { onClose } = renderPalette();
    const input = screen.getByLabelText(/search commands/i);
    input.focus();
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    fireEvent.keyDown(window, { key: 'Enter' });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('closes on Escape', () => {
    const { onClose } = renderPalette();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on backdrop click', () => {
    const { onClose } = renderPalette();
    fireEvent.mouseDown(screen.getByRole('presentation'));
    fireEvent.click(screen.getByRole('presentation'));
    // backdrop uses click target check; click the element itself
    const backdrop = screen.getByRole('presentation');
    fireEvent.click(backdrop, { target: backdrop, currentTarget: backdrop });
    expect(onClose).toHaveBeenCalled();
  });

  it('executes theme action with existing theme API', () => {
    const { onClose } = renderPalette();
    fireEvent.click(screen.getByText('Dark Theme'));
    expect(setThemeMock).toHaveBeenCalledWith('dark');
    expect(onClose).toHaveBeenCalled();
  });
});
