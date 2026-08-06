import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingPage from './common/LoadingPage/LoadingPage';

/**
 * ProtectedRoute — gates protected routes behind an authenticated session.
 *
 * While the session is being restored on first load (`loading` is true) it
 * renders a loading page instead of redirecting, preventing a flash of the
 * login screen. Unauthenticated users are redirected to /login with the
 * current location preserved so they can be returned after logging in.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Protected content
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingPage label="Restoring session…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
