import styles from './SkillBadge.module.css';

/**
 * @typedef {Object} SkillBadgeProps
 * @property {string} name - Skill name (e.g., "React", "Node.js")
 * @property {string} [icon] - Emoji or icon character (e.g., "⚛️")
 * @property {number} [proficiency] - Optional proficiency level 0-100
 * @property {string} [className]
 */

/**
 * Skill badge displaying an icon, skill name, and optional proficiency bar.
 *
 * @param {SkillBadgeProps} props
 */
function SkillBadge({ name, icon, proficiency, className = '' }) {
  const classNames = [styles.badge, className].filter(Boolean).join(' ');

  return (
    <div className={classNames} title={`${name}${proficiency != null ? ` — ${proficiency}%` : ''}`}>
      {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      <span className={styles.name}>{name}</span>
      {proficiency != null && (
        <div className={styles.proficiencyWrapper} role="meter" aria-valuenow={proficiency} aria-valuemin={0} aria-valuemax={100} aria-label={`${name} proficiency ${proficiency}%`}>
          <div
            className={styles.proficiencyBar}
            style={{ width: `${proficiency}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default SkillBadge;
