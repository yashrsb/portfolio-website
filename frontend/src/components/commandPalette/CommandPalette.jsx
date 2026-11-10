import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useProfile, useSocial } from '../../hooks';
import {
  getAllCommands,
  CATEGORY_ORDER,
  CATEGORY_ICONS,
} from './commands';
import styles from './CommandPalette.module.css';

const CATEGORY_LABELS = {
  Navigation: 'Navigation',
  Appearance: 'Appearance',
  Actions: 'Actions',
  Social: 'Social',
};

function Icon({ children, size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

function renderIcon(kind, size = 16) {
  switch (kind) {
    case 'home':
      return (
        <Icon size={size}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
        </Icon>
      );
    case 'about':
      return (
        <Icon size={size}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </Icon>
      );
    case 'experience':
      return (
        <Icon size={size}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M3 12h18" />
        </Icon>
      );
    case 'skills':
      return (
        <Icon size={size}>
          <path d="M4 20h16" />
          <path d="M7 16V9" />
          <path d="M12 16V5" />
          <path d="M17 16v-4" />
        </Icon>
      );
    case 'projects':
      return (
        <Icon size={size}>
          <path d="M3 7.5 12 3l9 4.5-9 4.5-9-4.5Z" />
          <path d="M3 16.5 12 21l9-4.5" />
          <path d="M3 12l9 4.5 9-4.5" />
        </Icon>
      );
    case 'blog':
      return (
        <Icon size={size}>
          <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </Icon>
      );
    case 'education':
      return (
        <Icon size={size}>
          <path d="M3 9 12 4l9 5-9 5-9-5Z" />
          <path d="M7 11.5V16c0 .8 2.2 2 5 2s5-1.2 5-2v-4.5" />
        </Icon>
      );
    case 'contact':
      return (
        <Icon size={size}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </Icon>
      );
    case 'navigation':
      return (
        <Icon size={size}>
          <circle cx="12" cy="12" r="8" />
          <path d="m15 9-2 6-6 2 2-6 6-2Z" />
        </Icon>
      );
    case 'appearance':
      return (
        <Icon size={size}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </Icon>
      );
    case 'light':
      return (
        <Icon size={size}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </Icon>
      );
    case 'dark':
      return (
        <Icon size={size}>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </Icon>
      );
    case 'system':
      return (
        <Icon size={size}>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8M12 16v4" />
        </Icon>
      );
    case 'action':
    case 'document':
      return (
        <Icon size={size}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
          <path d="M14 3v5h5M9 13h6M9 17h6" />
        </Icon>
      );
    case 'social':
    case 'external':
      return (
        <Icon size={size}>
          <path d="M15 3h6v6" />
          <path d="M10 14 21 3" />
          <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
        </Icon>
      );
    case 'github':
      return (
        <Icon size={size}>
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5a11.4 11.4 0 0 0-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        </Icon>
      );
    case 'linkedin':
      return (
        <Icon size={size}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6Z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </Icon>
      );
    case 'email':
      return (
        <Icon size={size}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </Icon>
      );
    case 'search':
      return (
        <Icon size={size}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </Icon>
      );
    default:
      return (
        <Icon size={size}>
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </Icon>
      );
  }
}

function getCommandIcon(command) {
  if (command.category === 'Navigation') return command.icon || 'navigation';
  if (command.category === 'Appearance') return command.icon || 'appearance';
  if (command.category === 'Actions') return 'document';
  if (command.category === 'Social') return command.icon || 'social';
  return command.icon || 'external';
}

function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { theme, preference, setTheme } = useTheme();
  const { profile, loading: profileLoading } = useProfile();
  const { socialLinks, loading: socialLoading } = useSocial();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const previousActiveElement = useRef(null);
  const searchInputRef = useRef(null);
  const commandElementsRef = useRef([]);

  const shortcutLabel =
    typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)
      ? 'Cmd K'
      : 'Ctrl K';

  const allCommands = useMemo(() => {
    if (profileLoading || socialLoading) return [];
    return getAllCommands({
      navigate,
      theme,
      preference,
      setTheme,
      profile,
      socialLinks,
    });
  }, [navigate, theme, preference, setTheme, profile, socialLinks, profileLoading, socialLoading]);

  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) return allCommands;
    const query = searchQuery.toLowerCase().trim();
    return allCommands.filter((cmd) => {
      const titleMatch = cmd.title.toLowerCase().includes(query);
      const descMatch = cmd.description?.toLowerCase().includes(query);
      const keywordMatch = cmd.keywords?.some((k) =>
        k.toLowerCase().includes(query),
      );
      return titleMatch || descMatch || keywordMatch;
    });
  }, [allCommands, searchQuery]);

  const groupedCommands = useMemo(() => {
    const groups = {};
    filteredCommands.forEach((cmd) => {
      const cat = cmd.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  const sortedCategories = useMemo(() => {
    const cats = Object.keys(groupedCommands);
    return cats.sort((a, b) => {
      const aIdx = CATEGORY_ORDER.indexOf(a);
      const bIdx = CATEGORY_ORDER.indexOf(b);
      if (aIdx === -1 && bIdx === -1) return a.localeCompare(b);
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });
  }, [groupedCommands]);

  const visibleCommands = useMemo(() => {
    const cmds = [];
    sortedCategories.forEach((cat) => {
      cmds.push(...groupedCommands[cat]);
    });
    return cmds;
  }, [groupedCommands, sortedCategories]);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setSearchQuery('');
      setActiveIndex(0);
      commandElementsRef.current = [];
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }

    document.body.style.overflow = '';
    previousActiveElement.current?.focus?.();
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    if (!isOpen) return;
    const el = commandElementsRef.current[activeIndex];
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex, isOpen]);

  const executeCommand = useCallback(
    (command) => {
      if (!command) return;
      try {
        command.action?.();
      } catch (err) {
        console.error('Command execution error:', err);
      }
      onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.isComposing) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (!visibleCommands.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, visibleCommands.length - 1));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        return;
      }

      if (e.key === 'Enter') {
        const activeEl = document.activeElement;
        const isPaletteInput = activeEl === searchInputRef.current;
        const isPaletteItem = activeEl?.closest?.('[data-command-item="true"]');
        if (isPaletteInput || isPaletteItem) {
          e.preventDefault();
          executeCommand(visibleCommands[activeIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, visibleCommands, activeIndex, onClose, executeCommand]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        data-command-palette="true"
      >
        <div className={styles.header}>
          <label htmlFor="command-search" className={styles.searchLabel}>
            Search commands
          </label>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon} aria-hidden="true">
              {renderIcon('search', 18)}
            </span>
            <input
              ref={searchInputRef}
              id="command-search"
              type="search"
              className={styles.searchInput}
              placeholder="Search pages, actions, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              aria-autocomplete="list"
              aria-controls="command-results"
              aria-activedescendant={
                visibleCommands[activeIndex]
                  ? `cmd-${visibleCommands[activeIndex].id}`
                  : undefined
              }
            />
            <kbd className={styles.shortcutHint}>{shortcutLabel}</kbd>
          </div>
        </div>

        <div
          id="command-results"
          className={styles.results}
          role="listbox"
          aria-label="Commands"
        >
          {visibleCommands.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon} aria-hidden="true">
                {renderIcon('search', 24)}
              </span>
              <p className={styles.emptyText}>
                {searchQuery
                  ? `No commands match “${searchQuery}”`
                  : 'No commands available'}
              </p>
            </div>
          ) : (
            sortedCategories.map((category) => (
              <div key={category} className={styles.category}>
                <div className={styles.categoryHeader}>
                  <span className={styles.categoryIcon} aria-hidden="true">
                    {renderIcon(CATEGORY_ICONS[category] || 'external', 14)}
                  </span>
                  <span className={styles.categoryLabel}>
                    {CATEGORY_LABELS[category] || category}
                  </span>
                </div>
                <div className={styles.categoryItems} role="group" aria-label={CATEGORY_LABELS[category] || category}>
                  {groupedCommands[category].map((command) => {
                    const globalIndex = visibleCommands.findIndex(
                      (c) => c.id === command.id,
                    );
                    const isActive = globalIndex === activeIndex;
                    return (
                      <div
                        key={command.id}
                        id={`cmd-${command.id}`}
                        data-command-item="true"
                        className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => executeCommand(command)}
                        onMouseEnter={() => {
                          if (globalIndex >= 0) setActiveIndex(globalIndex);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            executeCommand(command);
                          }
                        }}
                        tabIndex={-1}
                        ref={(el) => {
                          if (globalIndex >= 0) {
                            commandElementsRef.current[globalIndex] = el;
                          }
                        }}
                      >
                        <span className={styles.itemIcon} aria-hidden="true">
                          {renderIcon(getCommandIcon(command), 16)}
                        </span>
                        <div className={styles.itemContent}>
                          <span className={styles.itemTitle}>{command.title}</span>
                          {command.description ? (
                            <span className={styles.itemDescription}>
                              {command.description}
                            </span>
                          ) : null}
                        </div>
                        {command.isActive ? (
                          <span className={styles.itemActiveBadge}>Current</span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.footer} aria-hidden="true">
          <span className={styles.footerHint}>
            <kbd className={styles.footerKey}>↑</kbd>
            <kbd className={styles.footerKey}>↓</kbd>
            Navigate
          </span>
          <span className={styles.footerHint}>
            <kbd className={styles.footerKey}>Enter</kbd>
            Run
          </span>
          <span className={styles.footerHint}>
            <kbd className={styles.footerKey}>Esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
