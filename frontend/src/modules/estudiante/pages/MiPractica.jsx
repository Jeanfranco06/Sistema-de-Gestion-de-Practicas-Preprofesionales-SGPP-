import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, CircularProgress, Alert, Stepper, Step, StepLabel,
  Divider, Avatar, Paper, StepConnector, stepConnectorClasses
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { expedientesApi } from '../../../api/expedientesApi';
import { motion } from 'framer-motion';

// --- Custom Stepper Styling ---
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient( 95deg, #1976d2 0%, #42a5f5 50%, #90caf9 100%)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient( 95deg, #1976d2 0%, #42a5f5 50%, #90caf9 100%)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 48,
  height: 48,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    backgroundImage: 'linear-gradient( 136deg, #1976d2 0%, #42a5f5 50%, #90caf9 100%)',
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(ownerState.completed && {
    backgroundImage: 'linear-gradient( 136deg, #1976d2 0%, #42a5f5 50%, #90caf9 100%)',
  }),
}));

function ColorlibStepIcon(props) {
  const { active, completed, className, icon } = props;
  const icons = {
    1: <BusinessIcon />,
    2: <PersonIcon />,
    3: <CalendarIcon />,
    4: <SchoolIcon />,
    5: <CheckIcon />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {completed ? <CheckIcon /> : icons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}
// -----------------------------

const getSteps = (tipoPractica) => {
  if (tipoPractica === 'INICIAL') {
    return ['Inscripción', 'Plan de Trabajo', 'Desarrollo y Horas', 'Informe Parcial', 'Evaluación'];
  }
  return ['Inscripción', 'Plan de Trabajo', 'Desarrollo', 'Informe Final', 'Sustentación'];
};

const getActiveStep = (estado) => {
  const stepsMap = {
    'REGISTRADO': 0, 'BORRADOR': 0, 'EMPRESA_SEDE_ASIGNADA': 0, 'ASESOR_ASIGNADO': 0, 'COMITE_ASIGNADO': 0,
    'PLAN_PRESENTADO': 1, 'OBSERVADO': 1, 'SUBSANADO': 1,
    'APROBADO': 2, 'EN_EJECUCION': 2,
    'INFORME_PARCIAL_PRESENTADO': 3, 'INFORME_FINAL_PRESENTADO': 3,
    'EVALUADO': 4, 'CERRADO': 4
  };
  return stepsMap[estado] ?? 0;
};

export const MiPractica = () => {
  const [expediente, setExpediente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarExpediente();
  }, []);

  const cargarExpediente = async () => {
    try {
      const response = await expedientesApi.getMisExpedientes();
      if (response.data.success && response.data.data.length > 0) {
        const active = response.data.data.find(e => e.estado !== 'CERRADO' && e.estado !== 'ANULADO') 
                    || response.data.data[0];
        setExpediente(active);
      }
    } catch (err) {
      setError('Error al cargar la información de la práctica.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (error) return <Box p={4}><Alert severity="error">{error}</Alert></Box>;

  if (!expediente) {
    return (
      <Box p={4} sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 4, border: '1px solid #e0e0e0' }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No tienes ninguna práctica registrada
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Dirígete a tu Dashboard para solicitar una nueva práctica.
          </Typography>
        </Paper>
      </Box>
    );
  }

  const steps = getSteps(expediente.tipoPractica);
  const activeStep = getActiveStep(expediente.estado);

  return (
    <Box p={3} component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="800" color="primary.main" gutterBottom sx={{ mb: 1 }}>
        Mi Práctica {expediente.tipoPractica === 'INICIAL' ? 'Inicial' : 'Final'}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Sigue el progreso de tu práctica preprofesional a través de las diferentes etapas.
      </Typography>
      
      {/* Flowbar rediseñado */}
      <Paper elevation={0} sx={{ p: 4, mb: 5, borderRadius: 4, border: '1px solid', borderColor: 'grey.200', bgcolor: 'background.paper' }}>
        <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel StepIconComponent={ColorlibStepIcon}>
                <Typography variant="body2" fontWeight="600">{label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Tarjetas informativas con mejor espaciado */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ height: '100%', borderRadius: 4, border: '1px solid', borderColor: 'grey.200', transition: '0.3s', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.05)' } }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark', mr: 2, width: 56, height: 56 }}>
                  <BusinessIcon fontSize="medium" />
                </Avatar>
                <Typography variant="h5" fontWeight="700">Institución</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              {expediente.idEmpresa ? (
                <Box>
                  <Typography variant="h6" fontWeight="600" color="text.primary" gutterBottom>
                    {expediente.nombreEmpresa}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    RUC: {expediente.rucEmpresa}
                  </Typography>
                  <Chip icon={<BusinessIcon />} label={`Sede: ${expediente.nombreSede || 'Principal'}`} variant="outlined" color="primary" />
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Aún no has seleccionado una sede en el catálogo.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ height: '100%', borderRadius: 4, border: '1px solid', borderColor: 'grey.200', transition: '0.3s', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.05)' } }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.dark', mr: 2, width: 56, height: 56 }}>
                  <PersonIcon fontSize="medium" />
                </Avatar>
                <Typography variant="h5" fontWeight="700">Responsables</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Box mb={3} p={2} sx={{ bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="primary.main" display="flex" alignItems="center" gutterBottom>
                  <SchoolIcon fontSize="small" sx={{ mr: 1 }}/> Docente Asesor
                </Typography>
                {expediente.idAsesor ? (
                  <Typography variant="body1" fontWeight="500">{expediente.nombreAsesor}</Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">Pendiente de asignación</Typography>
                )}
              </Box>

              <Box p={2} sx={{ bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="secondary.main" display="flex" alignItems="center" gutterBottom>
                  <PersonIcon fontSize="small" sx={{ mr: 1 }}/> Tutor Externo
                </Typography>
                {expediente.nombreTutor ? (
                  <Typography variant="body1" fontWeight="500">{expediente.nombreTutor}</Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">Pendiente de asignación</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'grey.200' }}>
            <CardContent sx={{ p: 4 }}>
               <Box display="flex" alignItems="center" mb={3}>
                <Avatar sx={{ bgcolor: 'success.light', color: 'success.dark', mr: 2, width: 56, height: 56 }}>
                  <CalendarIcon fontSize="medium" />
                </Avatar>
                <Typography variant="h5" fontWeight="700">Progreso y Estado</Typography>
              </Box>
              <Divider sx={{ mb: 4 }} />
              <Grid container spacing={4}>
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Fecha de Inicio</Typography>
                  <Typography variant="h6" fontWeight="600">{expediente.fechaInicioPractica || '--/--/----'}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Duración Estimada</Typography>
                  <Typography variant="h6" fontWeight="600">{expediente.duracionSemanas ? `${expediente.duracionSemanas} semanas` : 'Por definir'}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Estado Actual</Typography>
                  <Box mt={1}>
                    <Chip label={expediente.estado.replace(/_/g, ' ')} color="primary" sx={{ fontWeight: 600 }} />
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Horas Acumuladas</Typography>
                  <Typography variant="h6" fontWeight="600" color="success.main">{expediente.horasAcumuladas || 0} hrs</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MiPractica;
