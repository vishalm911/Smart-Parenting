import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LoadingScreen } from './LoadingScreen';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Check if user is authenticated and has admin role
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
