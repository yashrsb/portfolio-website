import styles from './Footer.module.css';

/**
 * Footer — simple admin footer.
 *
 * @param {Object} props
 * @param {string} [props.version='1.0.0'] - App version
 */
function Footer({ version = '1.0.0' }) {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        © {year} Portfolio Admin — v{version}
      </p>
    </footer>
  );
}

export default Footer;
