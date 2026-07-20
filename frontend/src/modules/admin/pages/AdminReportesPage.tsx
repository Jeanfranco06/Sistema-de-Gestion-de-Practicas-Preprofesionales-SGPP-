import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';
import { isCoordinacionRole } from '../../../shared/utils/roleRoutes';
import { ReportesCoordinacion } from '../../coordinacion/pages/Reportes';

export default function AdminReportesPage() {
  const { user } = useAuth();

  if (isCoordinacionRole(user?.roles)) {
    return <Navigate to="/coordinacion/reportes" replace />;
  }

  return <ReportesCoordinacion variant="admin" />;
}
