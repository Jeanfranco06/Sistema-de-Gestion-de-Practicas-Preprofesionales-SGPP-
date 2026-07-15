import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Alert, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { AssignmentInd as StudentIcon, Description as DocIcon, Assessment as EvaluationIcon, Person as PersonIcon } from '@mui/icons-material';
import { useAuth } from '../../auth/AuthContext';
import { expedientesApi } from '../../api/expedientesApi';
import { motion } from 'framer-motion';

export const DashboardDocente = () => {
  const { user } = useAuth();
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarExpedientes();
  }, []);

  const cargarExpedientes = async () => {
    try {
      setLoading(true);
      const res = await expedientesApi.getMisExpedientes();
      if (res.data.success) {
        setExpedientes(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;

  const estudiantesActivos = expedientes.filter(e => e.estado === 'EN_EJECUCION').length;
  const planesPorAprobar = expedientes.filter(e => e.estado === 'PLAN_PRESENTADO').length;
  const informesPendientes = expedientes.filter(e => e.estado === 'INFORME_PRESENTADO').length;

  return (
    <Box p={3} component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Typography variant="h4" fontWeight="700" color="primary.main" gutterBottom>
        Dashboard Docente Asesor
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={4}>
        Bienvenido, {user?.nombre || 'Docente'}. Aquí tienes un resumen de tus practicantes.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3} sx={{ borderRadius: 3, display: 'flex', alignItems: 'center', p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mr: 2 }}>
              <StudentIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="800">{estudiantesActivos}</Typography>
              <Typography variant="body2">Prácticas en Ejecución</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3} sx={{ borderRadius: 3, display: 'flex', alignItems: 'center', p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mr: 2 }}>
              <DocIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="800">{planesPorAprobar}</Typography>
              <Typography variant="body2">Planes por Aprobar</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3} sx={{ borderRadius: 3, display: 'flex', alignItems: 'center', p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mr: 2 }}>
              <EvaluationIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="800">{informesPendientes}</Typography>
              <Typography variant="body2">Informes Pendientes de Revisión</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="600" mb={2}>Tus Practicantes Recientes</Typography>
            {expedientes.length === 0 ? (
              <Alert severity="info">No tienes practicantes asignados actualmente.</Alert>
            ) : (
              <List>
                {expedientes.slice(0, 5).map((exp, index) => (
                  <ListItem key={exp.id} divider={index < 4}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}><PersonIcon /></Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={`${exp.nombreEstudiante} ${exp.apellidoEstudiante}`}
                      secondary={`Estado: ${exp.estado} - Empresa: ${exp.empresa?.razonSocial || 'N/A'}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default DashboardDocente;
