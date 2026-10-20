import { useState, useCallback } from 'react';
import Navbar from '../../components/navigation/Navbar/Navbar';
import Footer from '../../components/footer/Footer/Footer';
import CommandPalette from '../../components/commandPalette/CommandPalette';
import { useTheme } from '../../context/ThemeContext';
import { useCommandPaletteShortcut } from '../../hooks';
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
  const [paletteOpen, setPaletteOpen] = useState(false);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useCommandPaletteShortcut(openPalette);

  return (
    <div className={styles.layout}>
      <Navbar theme={theme} onToggleTheme={toggleTheme} onOpenCommandPalette={openPalette} />
      <main className={styles.main} id="main-content">
        {children}
      </main>
      <Footer />
      <CommandPalette isOpen={paletteOpen} onClose={closePalette} />
    </div>
  );
}

export default MainLayout;
