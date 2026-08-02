import { useIntersectionObserver } from '../../../hooks';
import styles from './Reveal.module.css';

/**
 * @typedef {Object} RevealProps
 * @property {React.ReactNode} children - Content to reveal
 * @property {string} [as='div'] - HTML tag to render (e.g., 'li', 'article')
 * @property {number} [delay=0] - Transition delay in ms (for staggering)
 * @property {string} [className] - Additional CSS classes
 */

/**
 * Reveal — wraps content and fades/slides it in when it enters the viewport.
 * Animation triggers once and respects prefers-reduced-motion.
 *
 * @param {RevealProps} props
 */
function Reveal({ children, as: Tag = 'div', delay = 0, className = '' }) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.15 });

  const classes = [
    styles.reveal,
    isVisible ? styles.revealVisible : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      ref={ref}
      className={classes}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
