import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Alert, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { People as PeopleIcon, AssignmentTurnedIn as EvalIcon, Person as PersonIcon, Assessment as PerfIcon } from '@mui/icons-material';
import { useAuth } from '../../auth/AuthContext';
import { expedientesApi } from '../../api/expedientesApi';
import { motion } from 'framer-motion';

export const DashboardTutor = () => {
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

  const practicantesActivos = expedientes.filter(e => e.estado === 'EN_EJECUCION' || e.estado === 'INFORME_PRESENTADO').length;
  const porEvaluar = expedientes.filter(e => e.estado === 'INFORME_PRESENTADO').length;

  return (
    <Box p={3} component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Typography variant="h4" fontWeight="700" color="primary.main" gutterBottom>
        Portal del Tutor Externo
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={4}>
        Bienvenido, {user?.nombre || 'Tutor'}. Resumen de los practicantes en su área.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Card elevation={3} sx={{ borderRadius: 3, display: 'flex', alignItems: 'center', p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mr: 2 }}>
              <PeopleIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="800">{practicantesActivos}</Typography>
              <Typography variant="body2">Practicantes Activos</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card elevation={3} sx={{ borderRadius: 3, display: 'flex', alignItems: 'center', p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mr: 2 }}>
              <EvalIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="800">{porEvaluar}</Typography>
              <Typography variant="body2">Pendientes de Evaluación</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="600" mb={2}>Practicantes Asignados</Typography>
            {expedientes.length === 0 ? (
              <Alert severity="info">No tiene practicantes asignados actualmente.</Alert>
            ) : (
              <List>
                {expedientes.slice(0, 5).map((exp, index) => (
                  <ListItem key={exp.id} divider={index < 4}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}><PersonIcon /></Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={`${exp.nombreEstudiante} ${exp.apellidoEstudiante}`}
                      secondary={`Práctica ${exp.tipoPractica === 'INICIAL' ? 'Inicial' : 'Final'} - Estado: ${exp.estado}`}
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

export default DashboardTutor;
