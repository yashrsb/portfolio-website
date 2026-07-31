import styles from './Heading.module.css';

/**
 * Heading component for consistent typography across the site.
 * Renders the appropriate HTML heading tag based on `level`.
 *
 * @param {Object} props
 * @param {1 | 2 | 3 | 4} [props.level=1] - Heading level (1-4)
 * @param {React.ReactNode} props.children - Heading text content
 * @param {string} [props.subtitle] - Optional subtitle displayed below the heading
 * @param {'left' | 'center' | 'right'} [props.alignment='left'] - Text alignment
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.id] - Element ID for anchor linking
 */
function Heading({
  level = 1,
  children,
  subtitle,
  alignment = 'left',
  className = '',
  id,
}) {
  const Tag = `h${level}`;

  const headingClasses = [
    styles.heading,
    styles[`level-${level}`],
    styles[`align-${alignment}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.wrapper}>
      <Tag className={headingClasses} id={id}>
        {children}
      </Tag>
      {subtitle && (
        <p className={`${styles.subtitle} ${styles[`align-${alignment}`]}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default Heading;
