import styles from './Container.module.css';

/**
 * Reusable responsive Container wrapper.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to wrap
 * @param {'sm' | 'md' | 'lg' | 'xl'} [props.size='lg'] - Max-width preset
 * @param {boolean} [props.fluid=false] - If true, container spans full width without max-width
 * @param {string} [props.padding] - Custom padding override (CSS value)
 * @param {string} [props.className] - Additional CSS classes
 */
function Container({
  children,
  size = 'lg',
  fluid = false,
  padding,
  className = '',
}) {
  const classNames = [
    styles.container,
    fluid ? styles.fluid : styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const style = padding ? { padding } : undefined;

  return (
    <div className={classNames} style={style}>
      {children}
    </div>
  );
}

export default Container;
