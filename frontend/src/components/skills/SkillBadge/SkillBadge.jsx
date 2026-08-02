import { useEffect, useRef, useState } from 'react';
import { useIntersectionObserver } from '../../../hooks';
import styles from './SkillBadge.module.css';

/**
 * @typedef {Object} SkillBadgeProps
 * @property {string} name - Skill name (e.g., "React", "Node.js")
 * @property {string} [icon] - Emoji or icon character (e.g., "⚛️")
 * @property {number} [proficiency] - Optional proficiency level 0-100
 * @property {string} [className]
 */

/**
 * Skill badge displaying an icon, skill name, and optional animated proficiency bar.
 * The proficiency bar animates from 0% to target when it becomes visible.
 *
 * @param {SkillBadgeProps} props
 */
function SkillBadge({ name, icon, proficiency, className = '' }) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.4 });
  const [animate, setAnimate] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isVisible && proficiency != null) {
      // Slight delay so the fill is noticeable
      timerRef.current = setTimeout(() => setAnimate(true), 100);
    }
    return () => clearTimeout(timerRef.current);
  }, [isVisible, proficiency]);

  const barStyle = {
    transform: `scaleX(${animate ? proficiency / 100 : 0})`,
  };

  const classNames = [styles.badge, className].filter(Boolean).join(' ');

  return (
    <div
      ref={ref}
      className={classNames}
      title={`${name}${proficiency != null ? ` — ${proficiency}%` : ''}`}
    >
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.name}>{name}</span>
      {proficiency != null && (
        <div
          className={styles.proficiencyWrapper}
          role="meter"
          aria-valuenow={proficiency}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${name} proficiency ${proficiency}%`}
        >
          <div className={styles.proficiencyBar} style={barStyle} />
        </div>
      )}
    </div>
  );
}

export default SkillBadge;
