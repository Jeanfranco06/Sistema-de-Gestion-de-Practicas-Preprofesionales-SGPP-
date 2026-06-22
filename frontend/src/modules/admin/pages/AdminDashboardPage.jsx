import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';
import { isCoordinacionRole } from '../../../shared/utils/roleRoutes';
import { DashboardCoordinacion } from '../../coordinacion/pages/DashboardCoordinacion';

/**
 * Dashboard administrativo: vista operativa para secretaría, comité y admins.
 * Coordinador y director usan el Panel Ejecutivo en /coordinacion/dashboard.
 */
export default function AdminDashboardPage() {
  const { user } = useAuth();

  if (isCoordinacionRole(user?.roles)) {
    return <Navigate to="/coordinacion/dashboard" replace />;
  }

  return <DashboardCoordinacion variant="admin" />;
}
