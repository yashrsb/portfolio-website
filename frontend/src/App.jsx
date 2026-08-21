import { useLocation, Routes, Route } from 'react-router-dom';
import { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { MainLayout } from './layouts';
import { useAnalytics } from './hooks';
import LoadingState from './components/common/LoadingState/LoadingState';
import {
  Home,
  About,
  Experience,
  Skills,
  Projects,
  Education,
  Contact,
  Blog,
  CategoryPosts,
  TagPosts,
  NotFound,
} from './pages';

const ProjectDetailPage = lazy(
  () => import('./pages/ProjectDetailPage/ProjectDetailPage'),
);
const BlogPost = lazy(() => import('./pages/BlogPost/BlogPost'));

/**
 * App — root component defining all routes wrapped in the main layout.
 * Implements a lightweight fade transition between routes (< 250ms).
 * ProjectDetailPage and BlogPost are code-split for faster initial load.
 */
function App() {
  const location = useLocation();
  const [activeLocation, setActiveLocation] = useState(location);
  const [fading, setFading] = useState(false);
  const previousPath = useRef(location.pathname);

  useAnalytics();

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
        <Suspense fallback={<LoadingState label="Loading..." />}>
          <Routes location={activeLocation}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetailPage />} />
            <Route path="/education" element={<Education />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/category/:slug" element={<CategoryPosts />} />
            <Route path="/blog/tag/:slug" element={<TagPosts />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </MainLayout>
  );
}

export default App;
