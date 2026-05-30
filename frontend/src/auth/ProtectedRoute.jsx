import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Box, CircularProgress } from '@mui/material';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles) {
    const userRoles = user.roles || [];
    const hasPermission = allowedRoles.some((allowedRole) => {
      return userRoles.some(userRole => {
        const roleName = typeof userRole === 'string' ? userRole : userRole.authority || userRole.nombre;
        return roleName === allowedRole || roleName === `ROLE_${allowedRole}`;
      });
    });

    if (!hasPermission) {
      return <Navigate to="/no-autorizado" replace />;
    }
  }

  return children;
}
