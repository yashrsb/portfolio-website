import styles from './Section.module.css';

/**
 * Reusable page section with consistent spacing, optional title/subtitle,
 * background, and an ID for scroll navigation.
 *
 * @param {Object} props
 * @param {string} [props.title] - Section heading text
 * @param {string} [props.subtitle] - Section subtitle
 * @param {'default' | 'alt' | 'primary'} [props.background='default'] - Background variant
 * @param {string} [props.id] - Section ID for anchor linking / scroll
 * @param {React.ReactNode} props.children - Section content
 * @param {string} [props.className] - Additional CSS classes
 */
function Section({
  title,
  subtitle,
  background = 'default',
  id,
  children,
  className = '',
}) {
  const classNames = [styles.section, styles[background], className]
    .filter(Boolean)
    .join(' ');

  return (
    <section id={id} className={classNames}>
      <div className={styles.content}>
        {title && <h2 className={styles.title}>{title}</h2>}
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children && <div className={styles.body}>{children}</div>}
      </div>
    </section>
  );
}

export default Section;
