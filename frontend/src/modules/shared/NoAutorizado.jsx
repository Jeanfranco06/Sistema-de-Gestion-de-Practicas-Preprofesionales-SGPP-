import { Box, Typography, Button } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

export default function NoAutorizado() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  return (
    <Box sx={{ textAlign: 'center', py: 10 }}>
      <LockOutlined sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
      <Typography variant="h5" fontWeight={700} mb={1}>Acceso no autorizado</Typography>
      <Typography color="text.secondary" mb={3}>No tienes permisos para ver esta página.</Typography>
      <Button variant="contained" onClick={() => navigate(-1)}>Volver</Button>
      <Button sx={{ ml: 2 }} onClick={logout}>Cerrar sesión</Button>
    </Box>
  );
}
