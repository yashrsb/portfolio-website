import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import Footer from '../Footer/Footer';
import styles from './AdminLayout.module.css';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/experience': 'Experience',
  '/skills': 'Skills',
  '/education': 'Education',
  '/social-links': 'Social Links',
  '/resume': 'Resume',
  '/settings': 'Settings',
};

/**
 * AdminLayout — responsive shell combining sidebar, topbar, content, and footer.
 */
function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] || 'Admin';

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={styles.app}>
      {sidebarOpen && (
        <button
          type="button"
          className={styles.backdrop}
          onClick={closeSidebar}
          aria-label="Close navigation menu"
          tabIndex={-1}
        />
      )}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className={styles.main}>
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          pageTitle={pageTitle}
        />

        <main className={styles.content} id="main-content">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default AdminLayout;
