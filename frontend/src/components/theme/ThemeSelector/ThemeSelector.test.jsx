import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ThemeSelector from './ThemeSelector';

describe('ThemeSelector', () => {
  const onPreferenceChange = vi.fn();

  beforeEach(() => {
    onPreferenceChange.mockClear();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders a compact icon trigger instead of three visible tabs', () => {
    render(
      <ThemeSelector preference="system" onPreferenceChange={onPreferenceChange} />,
    );

    const trigger = screen.getByRole('button', {
      name: 'Theme preferences',
    });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls', 'theme-popover');

    // Popover options should not be visible initially
    expect(
      screen.queryByRole('menuitemradio', { name: /Light theme/ }),
    ).not.toBeInTheDocument();
  });

  it('shows the selected preference icon on the trigger', () => {
    const { rerender } = render(
      <ThemeSelector preference="dark" onPreferenceChange={onPreferenceChange} />,
    );
    expect(screen.getByRole('button', { name: 'Theme preferences' })).toBeInTheDocument();

    rerender(
      <ThemeSelector preference="light" onPreferenceChange={onPreferenceChange} />,
    );
    expect(screen.getByRole('button', { name: 'Theme preferences' })).toBeInTheDocument();
  });

  it('opens the popover when the trigger is clicked', () => {
    render(
      <ThemeSelector preference="system" onPreferenceChange={onPreferenceChange} />,
    );

    const trigger = screen.getByRole('button', { name: 'Theme preferences' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('menuitemradio', { name: /Light theme/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitemradio', { name: /Dark theme/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitemradio', { name: /System theme/ }),
    ).toBeInTheDocument();
  });

  it('closes the popover when the trigger is clicked again', () => {
    render(
      <ThemeSelector preference="system" onPreferenceChange={onPreferenceChange} />,
    );

    const trigger = screen.getByRole('button', { name: 'Theme preferences' });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('menuitemradio', { name: /Light theme/ }),
    ).not.toBeInTheDocument();
  });

  it('calls onPreferenceChange with the correct value when an option is clicked', () => {
    render(
      <ThemeSelector preference="light" onPreferenceChange={onPreferenceChange} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Theme preferences' }));
    fireEvent.click(screen.getByRole('menuitemradio', { name: /Dark theme/ }));
    expect(onPreferenceChange).toHaveBeenCalledWith('dark');

    fireEvent.click(screen.getByRole('button', { name: 'Theme preferences' }));
    fireEvent.click(screen.getByRole('menuitemradio', { name: /System theme/ }));
    expect(onPreferenceChange).toHaveBeenCalledWith('system');
  });

  it('indicates the currently selected option', () => {
    render(
      <ThemeSelector preference="dark" onPreferenceChange={onPreferenceChange} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Theme preferences' }));

    expect(
      screen.getByRole('menuitemradio', { name: /Dark theme/ }),
    ).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.getByRole('menuitemradio', { name: /Light theme/ }),
    ).toHaveAttribute('aria-checked', 'false');
    expect(
      screen.getByRole('menuitemradio', { name: /System theme/ }),
    ).toHaveAttribute('aria-checked', 'false');
  });

  it('closes the popover after a selection', () => {
    render(
      <ThemeSelector preference="light" onPreferenceChange={onPreferenceChange} />,
    );

    const trigger = screen.getByRole('button', { name: 'Theme preferences' });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('menuitemradio', { name: /Dark theme/ }));
    expect(onPreferenceChange).toHaveBeenCalledWith('dark');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('menuitemradio', { name: /Dark theme/ }),
    ).not.toBeInTheDocument();
  });

  it('closes the popover when Escape is pressed', () => {
    render(
      <ThemeSelector preference="system" onPreferenceChange={onPreferenceChange} />,
    );

    const trigger = screen.getByRole('button', { name: 'Theme preferences' });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('menuitemradio', { name: /Light theme/ }),
    ).not.toBeInTheDocument();
  });

  it('closes the popover when the user clicks outside', () => {
    render(
      <div>
        <button>Outside button</button>
        <ThemeSelector preference="system" onPreferenceChange={onPreferenceChange} />
      </div>,
    );

    const trigger = screen.getByRole('button', { name: 'Theme preferences' });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Outside button' }));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not close the popover when an option is clicked (outside-click should not fire first)', () => {
    render(
      <ThemeSelector preference="light" onPreferenceChange={onPreferenceChange} />,
    );

    const trigger = screen.getByRole('button', { name: 'Theme preferences' });
    fireEvent.click(trigger);

    const option = screen.getByRole('menuitemradio', { name: /Dark theme/ });
    // mousedown on the option should not close the popover before click
    fireEvent.mouseDown(option);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(option);
    expect(onPreferenceChange).toHaveBeenCalledWith('dark');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not change the theme merely by opening the popover', () => {
    render(
      <ThemeSelector preference="light" onPreferenceChange={onPreferenceChange} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Theme preferences' }));
    expect(onPreferenceChange).not.toHaveBeenCalled();
  });
});