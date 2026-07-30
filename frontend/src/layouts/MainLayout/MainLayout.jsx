import Navbar from '../../components/navigation/Navbar/Navbar';
import Footer from '../../components/footer/Footer/Footer';
import { useTheme } from '../../context/ThemeContext';
import styles from './MainLayout.module.css';

/**
 * MainLayout wraps every page with the Navbar, main content area, and Footer.
 * Handles theme toggling and responsive spacing automatically.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 */
function MainLayout({ children }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.layout}>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main className={styles.main} id="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
