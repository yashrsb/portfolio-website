/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout/AdminLayout';
import ToastStack from './components/ToastStack/ToastStack';
import ErrorBoundary from './components/common/errors/ErrorBoundary/ErrorBoundary';
import LoginPage from './pages/LoginPage/LoginPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage';
import SkillsPage from './pages/SkillsPage/SkillsPage';
import ExperiencePage from './pages/ExperiencePage/ExperiencePage';
import EducationPage from './pages/EducationPage/EducationPage';
import SocialLinksPage from './pages/SocialLinksPage/SocialLinksPage';
import ContactMessagesPage from './pages/ContactMessagesPage/ContactMessagesPage';
import ResumePage from './pages/ResumePage/ResumePage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import BlogPostsPage from './pages/BlogPostsPage/BlogPostsPage';
import BlogCategoriesPage from './pages/BlogCategoriesPage/BlogCategoriesPage';
import BlogTagsPage from './pages/BlogTagsPage/BlogTagsPage';
import AnalyticsPage from './pages/AnalyticsPage/AnalyticsPage';

const AdminShell = () => (
  <>
    <ToastStack />
    <ProtectedRoute>
      <AdminLayout />
    </ProtectedRoute>
  </>
);

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
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'skills', element: <SkillsPage /> },
      { path: 'experience', element: <ExperiencePage /> },
      { path: 'education', element: <EducationPage /> },
      { path: 'social-links', element: <SocialLinksPage /> },
      { path: 'contact-messages', element: <ContactMessagesPage /> },
      { path: 'blog', element: <BlogPostsPage /> },
      { path: 'blog/categories', element: <BlogCategoriesPage /> },
      { path: 'blog/tags', element: <BlogTagsPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
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
