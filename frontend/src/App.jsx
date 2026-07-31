import { useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { MainLayout } from './layouts';
import {
  Home,
  About,
  Experience,
  Skills,
  Projects,
  Education,
  Contact,
  NotFound,
} from './pages';

const PAGE_COMPONENTS = {
  '/': Home,
  '/about': About,
  '/experience': Experience,
  '/skills': Skills,
  '/projects': Projects,
  '/education': Education,
  '/contact': Contact,
};

/**
 * App — root component defining all routes wrapped in the main layout.
 * Implements a lightweight fade transition between routes (< 250ms).
 */
function App() {
  const location = useLocation();
  const [activePath, setActivePath] = useState(location.pathname);
  const [fading, setFading] = useState(false);
  const previousPath = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname === previousPath.current) return;

    setFading(true);
    const timer = setTimeout(() => {
      setActivePath(location.pathname);
      setFading(false);
      previousPath.current = location.pathname;
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const PageComponent =
    PAGE_COMPONENTS[activePath] ||
    PAGE_COMPONENTS[Object.keys(PAGE_COMPONENTS).find(
      (k) => k !== '/' && activePath.startsWith(k),
    )] ||
    NotFound;

  return (
    <MainLayout>
      <div
        className={fading ? 'page-transition-exit' : 'page-transition-enter'}
      >
        <PageComponent />
      </div>
    </MainLayout>
  );
}

export default App;
