import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/shared/LoadingSpinner';

// ─────────────────────────────────────────────────────────────────────────────
// DEV MODE — bypass role checks when VITE_DEV_MODE=true
// ─────────────────────────────────────────────────────────────────────────────
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

/**
 * RoleRoute - Ensures user has the required role
 * Redirects to role-specific dashboard if role doesn't match.
 * Waits for JWT auth AND role (isRoleReady) to be resolved
 * before checking roles, preventing premature redirects.
 *
 * In DEV_MODE (VITE_DEV_MODE=true) the role is automatically derived from the
 * URL path prefix (/parent → parent, /teacher → teacher, etc.) so every
 * dashboard is accessible without authentication.
 * The JWT role-check flow is used when DEV_MODE is false.
 */
const RoleRoute = ({ children, allowedRoles = [] }) => {
  // Hooks must always be called unconditionally (React rules of hooks)
  const location = useLocation();
  const { userRole, isAuthenticated, loading, isRoleReady } = useAuth();

  // DEV_MODE: derive correct role from path and always allow access
  if (DEV_MODE) {
    const path = location.pathname;
    const devRole =
      path.startsWith('/parent')  ? 'parent'  :
      path.startsWith('/teacher') ? 'teacher' :
      path.startsWith('/admin')   ? 'admin'   :
      path.startsWith('/child')   ? 'child'   :
      (allowedRoles[0] || 'parent'); // fallback to first allowed role

    // Allowed roles already include this route's role — just render
    if (allowedRoles.includes(devRole) || allowedRoles.length === 0) {
      return children;
    }
  }

  // Wait for JWT auth state to resolve
  if (loading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  // Wait for role to be fetched after JWT auth resolves
  // This prevents the redirect race condition where userRole is null
  // for a split second after login
  if (!isRoleReady) {
    return <LoadingSpinner fullScreen message="Loading your profile..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    // Redirect to the appropriate dashboard based on role
    const roleDashboards = {
      child: '/child/dashboard',
      parent: '/parent/dashboard',
      teacher: '/teacher/dashboard',
      admin: '/admin/dashboard',
    };

    const redirectTo = roleDashboards[userRole] || '/';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RoleRoute;
