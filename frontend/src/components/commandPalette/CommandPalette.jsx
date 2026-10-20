import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useProfile } from '../../hooks';
import { useSocial } from '../../hooks';
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

function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { profile, loading: profileLoading } = useProfile();
  const { socialLinks, loading: socialLoading } = useSocial();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const previousActiveElement = useRef(null);
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);
  const commandElementsRef = useRef([]);

  const allCommands = useMemo(() => {
    if (profileLoading || socialLoading) return [];
    return getAllCommands({
      navigate,
      theme,
      setTheme,
      profile,
      socialLinks,
    });
  }, [navigate, theme, setTheme, profile, socialLinks, profileLoading, socialLoading]);

  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) return allCommands;

    const query = searchQuery.toLowerCase().trim();
    return allCommands.filter((cmd) => {
      const titleMatch = cmd.title.toLowerCase().includes(query);
      const descMatch = cmd.description?.toLowerCase().includes(query);
      const keywordMatch = cmd.keywords?.some((k) => k.toLowerCase().includes(query));
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
      document.body.style.overflow = 'hidden';
      setSearchQuery('');
      setActiveIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    } else {
      document.body.style.overflow = '';
      previousActiveElement.current?.focus?.();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [searchQuery]);

   const executeCommand = useCallback((command) => {
     try {
       command.action?.();
     } catch (err) {
       console.error('Command execution error:', err);
     }
     onClose();
   }, [onClose]);

   const handleKeyDown = useCallback((e) => {
     if (!isOpen) return;

     if (e.key === 'Escape') {
       e.preventDefault();
       onClose();
       return;
     }

     if (e.target === searchInputRef.current) {
       if (e.key === 'ArrowDown') {
         e.preventDefault();
         setActiveIndex((prev) => Math.min(prev + 1, visibleCommands.length - 1));
       } else if (e.key === 'ArrowUp') {
         e.preventDefault();
         setActiveIndex((prev) => Math.max(prev - 1, 0));
       } else if (e.key === 'Enter') {
         e.preventDefault();
         if (visibleCommands[activeIndex]) {
           executeCommand(visibleCommands[activeIndex]);
         }
       }
     } else if (e.key === 'ArrowDown') {
       e.preventDefault();
       searchInputRef.current?.focus();
       setActiveIndex((prev) => Math.min(prev + 1, visibleCommands.length - 1));
     } else if (e.key === 'ArrowUp') {
       e.preventDefault();
       setActiveIndex((prev) => Math.max(prev - 1, 0));
     } else if (e.key === 'Enter') {
       e.preventDefault();
       if (visibleCommands[activeIndex]) {
         executeCommand(visibleCommands[activeIndex]);
       }
     }
   }, [isOpen, visibleCommands, activeIndex, onClose, executeCommand, searchInputRef]);

   useEffect(() => {
     if (!isOpen) return;

     window.addEventListener('keydown', handleKeyDown);
     return () => window.removeEventListener('keydown', handleKeyDown);
   }, [isOpen, handleKeyDown]);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && visibleCommands[activeIndex]) {
      e.preventDefault();
      executeCommand(visibleCommands[activeIndex]);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleResultClick = (command) => {
    executeCommand(command);
  };

  const handleResultKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      executeCommand(visibleCommands[index]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
    >
      <div
        className={styles.dialog}
        ref={resultsRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <label htmlFor="command-search" className={styles.searchLabel}>
            Search commands
          </label>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon} aria-hidden="true">
              ⌘
            </span>
            <input
              ref={searchInputRef}
              id="command-search"
              type="search"
              className={styles.searchInput}
              placeholder="Search pages, actions, and more..."
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
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
            <kbd className={styles.shortcutHint}>⌘K</kbd>
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
              <span className={styles.emptyIcon} aria-hidden="true">🔍</span>
              <p className={styles.emptyText}>
                {searchQuery
                  ? `No commands match "${searchQuery}"`
                  : 'No commands available'}
              </p>
            </div>
          ) : (
            sortedCategories.map((category) => (
              <div key={category} className={styles.category}>
                <div className={styles.categoryHeader}>
                  <span className={styles.categoryIcon} aria-hidden="true">
                    {CATEGORY_ICONS[category] || '•'}
                  </span>
                  <span className={styles.categoryLabel}>
                    {CATEGORY_LABELS[category] || category}
                  </span>
                </div>
                <div className={styles.categoryItems} role="group">
                  {groupedCommands[category].map((command) => {
                    const globalIndex = visibleCommands.findIndex(
                      (c) => c.id === command.id
                    );
                    const isActive = globalIndex === activeIndex;
                    return (
                      <div
                        key={command.id}
                        id={`cmd-${command.id}`}
                        className={`${styles.item} ${
                          isActive ? styles.itemActive : ''
                        }`}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => handleResultClick(command)}
                        onKeyDown={(e) => handleResultKeyDown(e, globalIndex)}
                        tabIndex={-1}
                        ref={(el) => {
                          commandElementsRef.current[globalIndex] = el;
                        }}
                      >
                        <span className={styles.itemIcon} aria-hidden="true">
                          {command.icon}
                        </span>
                        <div className={styles.itemContent}>
                          <span className={styles.itemTitle}>{command.title}</span>
                          {command.description && (
                            <span className={styles.itemDescription}>
                              {command.description}
                            </span>
                          )}
                        </div>
                        {command.isActive && (
                          <span className={styles.itemActiveBadge}>Current</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;