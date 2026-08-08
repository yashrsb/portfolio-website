/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from 'react-router-dom';
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
 * Shared layout element: ToastStack + protected admin shell.
 */
const AdminShell = () => (
  <>
    <ToastStack />
    <ProtectedRoute>
      <AdminLayout />
    </ProtectedRoute>
  </>
);

/**
 * Admin application router (data router).
 *
 * A data router (createBrowserRouter) is required because some pages use
 * useDirtyForm → useBlocker, which only works with a data router.
 *
 * Route structure:
 * - /login — public
 * - Everything else is wrapped in ProtectedRoute + AdminLayout
 */
const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <>
        <ToastStack />
        <LoginPage />
      </>
    ),
  },
  {
    path: '/',
    element: <AdminShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'skills', element: <SkillsPage /> },
      { path: 'experience', element: <ExperiencePage /> },
      { path: 'education', element: <EducationPage /> },
      { path: 'social-links', element: <SocialLinksPage /> },
      { path: 'resume', element: <ResumePage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '*',
    element: (
      <>
        <ToastStack />
        <NotFoundPage />
      </>
    ),
  },
]);

export default router;