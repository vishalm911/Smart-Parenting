import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useAuth();
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

  // DEV_MODE: bypass all auth
  if (DEV_MODE) return children;

  // Wait for auth to resolve
  if (loading) {
    return <LoadingSpinner fullScreen message="Verifying your session..." />;
  }

  const activeUser = currentUser || storedUser;

  // Not logged in → redirect to home
  if (!activeUser) {
    return <Navigate to="/" replace />;
  }

  // Role check — if allowedRoles specified, verify user has permission
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(activeUser.role)) {
      // Redirect to their own dashboard
      const dashboards = {
        parent:  '/parent/dashboard',
        teacher: '/teacher/dashboard',
        admin:   '/admin/dashboard',
        child:   '/child/dashboard',
      };
      return <Navigate to={dashboards[activeUser.role] || '/'} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;