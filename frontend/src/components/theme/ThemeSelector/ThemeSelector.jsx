import styles from './ThemeSelector.module.css';

/**
 * @typedef {'light' | 'dark' | 'system'} ThemePreference
 */

/**
 * ThemeSelector — Segmented control for choosing light, dark, or system theme.
 *
 * Renders a compact three-option toggle with icons and an accessible label.
 * Uses the existing design system tokens and respects reduced-motion.
 *
 * @param {Object} props
 * @param {ThemePreference} props.preference - Currently selected preference.
 * @param {(pref: ThemePreference) => void} props.onPreferenceChange - Change handler.
 * @param {string} [props.className] - Additional CSS classes.
 */
function ThemeSelector({ preference, onPreferenceChange, className = '' }) {
  const options = [
    { value: 'light', label: 'Light', icon: '☀️', ariaLabel: 'Light mode' },
    { value: 'dark', label: 'Dark', icon: '🌙', ariaLabel: 'Dark mode' },
    { value: 'system', label: 'System', icon: '🖥️', ariaLabel: 'System (follow OS) mode' },
  ];

  const classNames = [styles.selector, className].filter(Boolean).join(' ');

  return (
    <div
      className={classNames}
      role="group"
      aria-label="Theme preference"
    >
      {options.map((opt) => {
        const isActive = preference === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={opt.ariaLabel}
            title={opt.ariaLabel}
            className={`${styles.option} ${isActive ? styles.optionActive : ''}`}
            onClick={() => onPreferenceChange(opt.value)}
          >
            <span className={styles.icon} aria-hidden="true">
              {opt.icon}
            </span>
            <span className={styles.label}>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ThemeSelector;