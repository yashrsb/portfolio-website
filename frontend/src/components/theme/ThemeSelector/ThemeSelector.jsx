import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './ThemeSelector.module.css';

/**
 * @typedef {'light' | 'dark' | 'system'} ThemePreference
 */

/**
 * Inline SVG icons for theme preferences.
 * Uses simple stroke-based paths compatible with both light and dark themes.
 * No external icon dependency.
 */
const ICONS = {
  light: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  ),
  dark: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  system: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
};

const OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

/**
 * ThemeSelector — Compact icon trigger with a popover for choosing
 * light, dark, or system theme preference.
 *
 * The closed trigger occupies approximately the same space as the
 * original single-button theme toggle. Clicking the trigger opens a
 * small popover with three clearly labeled options.
 *
 * @param {Object} props
 * @param {ThemePreference} props.preference - Currently selected preference.
 * @param {(pref: ThemePreference) => void} props.onPreferenceChange - Change handler.
 * @param {string} [props.className] - Additional CSS classes.
 */
function ThemeSelector({ preference, onPreferenceChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  // Close the popover when the user clicks outside the component.
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Close the popover on Escape.
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback(
    (value) => {
      onPreferenceChange(value);
      setIsOpen(false);
    },
    [onPreferenceChange],
  );

  const triggerIcon = ICONS[preference] || ICONS.system;
  const classNames = [styles.selector, className].filter(Boolean).join(' ');

  return (
    <div className={classNames} ref={triggerRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-label="Theme preferences"
        aria-expanded={isOpen}
        aria-controls="theme-popover"
        aria-haspopup="true"
        onClick={toggleOpen}
      >
        <span className={styles.triggerIcon} aria-hidden="true">
          {triggerIcon}
        </span>
      </button>

      {isOpen && (
        <div
          id="theme-popover"
          ref={popoverRef}
          className={styles.popover}
          role="menu"
          aria-label="Theme preferences"
        >
          <div className={styles.popoverHeader} aria-hidden="true">
            <span className={styles.popoverTitle}>Theme</span>
          </div>
          <div className={styles.options} role="none">
            {OPTIONS.map((opt) => {
              const isActive = preference === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  aria-label={`${opt.label} theme`}
                  className={`${styles.option} ${isActive ? styles.optionActive : ''}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  <span className={styles.optionIcon} aria-hidden="true">
                    {ICONS[opt.value]}
                  </span>
                  <span className={styles.optionLabel}>{opt.label}</span>
                  {isActive && (
                    <span className={styles.checkmark} aria-hidden="true">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeSelector;