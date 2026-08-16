import { useLocation, Routes, Route } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { MainLayout } from './layouts';
import {
  Home,
  About,
  Experience,
  Skills,
  Projects,
  ProjectDetailPage,
  Education,
  Contact,
  NotFound,
} from './pages';

/**
 * App — root component defining all routes wrapped in the main layout.
 * Implements a lightweight fade transition between routes (< 250ms).
 */
function App() {
  const location = useLocation();
  const [activeLocation, setActiveLocation] = useState(location);
  const [fading, setFading] = useState(false);
  const previousPath = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname === previousPath.current) return;

    setFading(true);
    const timer = setTimeout(() => {
      setActiveLocation(location);
      setFading(false);
      previousPath.current = location.pathname;
    }, 150);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <MainLayout>
      <div
        className={fading ? 'page-transition-exit' : 'page-transition-enter'}
      >
        <Routes location={activeLocation}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path="/education" element={<Education />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </MainLayout>
  );
}

export default App;
