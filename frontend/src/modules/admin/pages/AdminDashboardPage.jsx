import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';
import { isCoordinacionRole } from '../../../shared/utils/roleRoutes';
import DashboardSecretaria from '../../secretaria/pages/DashboardSecretaria';

/**
 * Dashboard administrativo: vista operativa para secretaría, comité y admins.
 * Coordinador y director usan el Panel Ejecutivo en /coordinacion/dashboard.
 */
export default function AdminDashboardPage() {
  const { user } = useAuth();

  if (isCoordinacionRole(user?.roles)) {
    return <Navigate to="/coordinacion/dashboard" replace />;
  }

  return <DashboardSecretaria />;
}
