import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout/AdminLayout';
import ToastStack from './components/ToastStack/ToastStack';
import LoginPage from './pages/LoginPage/LoginPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage';
import SkillsPage from './pages/SkillsPage/SkillsPage';
import ExperiencePage from './pages/ExperiencePage/ExperiencePage';
import EducationPage from './pages/EducationPage/EducationPage';
import SocialLinksPage from './pages/SocialLinksPage/SocialLinksPage';
import ResumePage from './pages/ResumePage/ResumePage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';

/**
 * Admin application root.
 * Route structure:
 * - /login — public
 * - Everything else is wrapped in ProtectedRoute + AdminLayout
 */
function App() {
  return (
    <>
      <ToastStack />

      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/education" element={<EducationPage />} />
          <Route path="/social-links" element={<SocialLinksPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
