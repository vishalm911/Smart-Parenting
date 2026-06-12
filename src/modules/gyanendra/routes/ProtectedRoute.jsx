import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/shared/LoadingSpinner';

// ─────────────────────────────────────────────────────────────────────────────
// DEV MODE — bypass all auth checks when VITE_DEV_MODE=true
// ─────────────────────────────────────────────────────────────────────────────
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

/**
 * ProtectedRoute - Ensures user is authenticated
 * Redirects to home/login if not authenticated.
 * Waits for both Firebase auth AND Firestore role to be resolved before
 * rendering children or redirecting, preventing flicker redirects.
 *
 * In DEV_MODE (VITE_DEV_MODE=true) all access is automatically allowed.
 * The original Firebase auth flow is used when DEV_MODE is false.
 */
const ProtectedRoute = ({ children }) => {
  // Hooks must always be called unconditionally (React rules of hooks)
  const { isAuthenticated, loading, isRoleReady } = useAuth();

  // DEV_MODE: always allow access, no Firebase calls needed
  if (DEV_MODE) return children;

  // Wait for Firebase to resolve initial auth state
  if (loading) {
    return <LoadingSpinner fullScreen message="Verifying your session..." />;
  }

  // Wait for Firestore role to be fetched after Firebase auth resolves
  if (!isRoleReady) {
    return <LoadingSpinner fullScreen message="Loading your profile..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
