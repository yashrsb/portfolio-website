import { describe, it, expect, vi } from 'vitest';
import {
  createNavigationCommands,
  createThemeCommands,
  createResumeCommand,
  createSocialCommands,
} from './commands';

describe('commandPalette commands', () => {
  it('creates navigation commands', () => {
    const navigate = vi.fn();
    const cmds = createNavigationCommands(navigate);
    expect(cmds.length).toBeGreaterThan(0);
    expect(cmds.find((c) => c.id === 'nav-/')).toBeTruthy();
    cmds[0].action();
    expect(navigate).toHaveBeenCalled();
  });

  it('marks active theme by preference', () => {
    const setTheme = vi.fn();
    const cmds = createThemeCommands('light', setTheme, 'system');
    expect(cmds.find((c) => c.id === 'theme-system')?.isActive).toBe(true);
    cmds.find((c) => c.id === 'theme-dark')?.action();
    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('returns resume command only for safe URLs', () => {
    expect(createResumeCommand(null)).toEqual([]);
    expect(createResumeCommand({ resumeUrl: 'javascript:alert(1)' })).toEqual([]);
    const cmds = createResumeCommand({ resumeUrl: 'https://example.com/resume.pdf' });
    expect(cmds).toHaveLength(1);
  });

  it('filters unsafe social links and handles mailto', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const cmds = createSocialCommands([
      { id: 1, platform: 'github', url: 'https://github.com/x' },
      { id: 2, platform: 'bad', url: 'javascript:1' },
      { id: 3, platform: 'email', url: 'mailto:test@example.com' },
    ]);
    expect(cmds.map((c) => c.id)).toEqual(['social-1', 'social-3']);
    cmds[0].action();
    expect(open).toHaveBeenCalled();
    open.mockRestore();
  });
});
