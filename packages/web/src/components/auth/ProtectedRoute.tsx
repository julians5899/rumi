import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { Spinner } from '../ui/Spinner';
import { RumiLogo } from '../ui/RumiLogo';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-rumi-bg gap-4 animate-fade-in">
        <RumiLogo size="md" />
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
