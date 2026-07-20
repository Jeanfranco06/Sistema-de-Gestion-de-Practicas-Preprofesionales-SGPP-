import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: '100vh' }}
      >
        <Loader2
          className="animate-spin"
          style={{ width: 40, height: 40, color: 'var(--color-primary-500)' }}
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles) {
    const userRoles = user.roles || [];
    const hasPermission = allowedRoles.some((allowedRole) => {
      return userRoles.some((userRole) => {
        const roleName = typeof userRole === 'string' ? userRole : userRole.authority || userRole.nombre;
        return roleName === allowedRole || roleName === `ROLE_${allowedRole}`;
      });
    });

    if (!hasPermission) {
      return <Navigate to="/no-autorizado" replace />;
    }
  }

  return <>{children}</>;
}
