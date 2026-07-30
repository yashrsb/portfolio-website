import styles from './Card.module.css';

/**
 * Reusable Card component for displaying content in a contained box.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {'sm' | 'md' | 'lg'} [props.shadow='md'] - Shadow depth
 * @param {'sm' | 'md' | 'lg' | 'xl' | 'none'} [props.padding='md'] - Padding preset
 * @param {boolean} [props.hoverable=false] - Whether card lifts on hover
 * @param {'sm' | 'md' | 'lg' | 'xl' | 'none'} [props.rounded='md'] - Border radius preset
 * @param {string} [props.className] - Additional CSS classes
 */
function Card({
  children,
  shadow = 'md',
  padding = 'md',
  hoverable = false,
  rounded = 'md',
  className = '',
}) {
  const classNames = [
    styles.card,
    styles[`shadow-${shadow}`],
    styles[`padding-${padding}`],
    styles[`rounded-${rounded}`],
    hoverable ? styles.hoverable : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} tabIndex={hoverable ? 0 : undefined}>
      {children}
    </div>
  );
}

export default Card;
