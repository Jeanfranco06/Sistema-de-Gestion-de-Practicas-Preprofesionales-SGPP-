import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, Chip,
  Button, Alert, CircularProgress, IconButton, Stack, LinearProgress,
  Paper, Tooltip, Avatar, Fade
} from '@mui/material';
import {
  Business, TrendingUp, Refresh,
  Assignment, AccessTime, FolderOpen, School, TaskAlt,
  ArrowForwardIos, PlayArrow, Person, ArrowBack, LocationOn
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { practicaApi } from '../../../api/practicasApi';
import { horasEstudianteApi } from '../../../api/horasApi';
import { tieneControlHoras } from '../../../shared/utils/controlHoras';

// Componente Card Premium responsivo (igual que en DashboardEstudiante)
const DashboardCard = ({ title, action, children, sx }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2.5, sm: 3, md: 4 },
      borderRadius: 4,
      border: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.paper',
      boxShadow: '0 4px 20px -10px rgba(0,0,0,0.05)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      ...sx
    }}
  >
    {(title || action) && (
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        mb: 3
      }}>
        {title && <Typography variant="h6"  color="text.primary" sx={{ fontWeight: 700,  fontSize: { xs: '1.1rem', md: '1.25rem' } }}>{title}</Typography>}
        {action && <Box sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>{action}</Box>}
      </Box>
    )}
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>{children}</Box>
  </Paper>
);

const getStatusProps = (status) => {
  const map = {
    'REGISTRADA': { color: 'primary', label: 'Registrada', bg: '#eff6ff', text: '#1e40af' },
    'ACEPTADA': { color: 'success', label: 'Aceptada', bg: '#ecfdf5', text: '#065f46' },
    'EN_CURSO': { color: 'info', label: 'En Curso', bg: '#e0f2fe', text: '#0c4a6e' },
    'FINALIZADA': { color: 'secondary', label: 'Finalizada', bg: '#f0fdfa', text: '#115e59' },
    'CANCELADA': { color: 'error', label: 'Cancelada', bg: '#fef2f2', text: '#991b1b' },
  };
  return map[status] || { color: 'default', label: status || 'Desconocido', bg: '#f1f5f9', text: '#475569' };
};

export const MiPractica = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [practica, setPractica] = useState(null);
  const [error, setError] = useState(null);
  const [horasData, setHorasData] = useState({ horasRequeridas: 0, horasValidadas: 0 });

  useEffect(() => {
    const fetchPractica = async () => {
      try {
        setLoading(true);
        const response = await practicaApi.getMiPractica();
        const data = response.data?.data || response.data;
        setPractica(data);
        if ((data?.idExpediente || data?.expedienteId) && tieneControlHoras(data.estadoExpediente || data.estado)) {
          const cumplimientoRes = await horasEstudianteApi.getCumplimiento(data.idExpediente || data.expedienteId).catch(() => null);
          const cumplimiento = cumplimientoRes?.data?.data || {};
          setHorasData({
            horasRequeridas: cumplimiento.horasRequeridas || data.horasRequeridas || 0,
            horasValidadas: cumplimiento.horasValidadas || 0,
          });
        } else if (data) {
          setHorasData({
            horasRequeridas: data.horasRequeridas || 0,
            horasValidadas: 0,
          });
        }
      } catch (err) {
        console.error("Error fetching mi práctica:", err);
        setError("No se pudo cargar la información de tu práctica.");
      } finally {
        setLoading(false);
      }
    };

    fetchPractica();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 3 }}>
        <CircularProgress size={48} thickness={4} sx={{ color: '#1a365d' }} />
        <Typography sx={{ fontWeight: 500 }} variant="body1" color="text.secondary">Cargando información de tu práctica...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ px: { xs: 1.5, sm: 2, md: 2.5 }, py: { xs: 2, md: 4 }, width: '100%' }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
      </Box>
    );
  }

  if (!practica) {
    return (
      <Box sx={{ px: { xs: 1.5, sm: 2, md: 2.5 }, py: { xs: 2, md: 4 }, width: '100%' }}>
        <Fade in timeout={800}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 4, md: 10 } }}>
            <Paper
              elevation={0}
              sx={{
                textAlign: 'center', py: { xs: 6, md: 10 }, px: { xs: 3, md: 6 },
                borderRadius: 6, border: '1px solid', borderColor: 'divider',
                maxWidth: 600, width: '100%',
                background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
              }}
            >
              <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 3, bgcolor: '#f1f5f9', color: '#64748b' }}>
                <Assignment sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h4"  color="#1a365d" gutterBottom sx={{ fontWeight: 800,  fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                No tienes una práctica activa
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 5, lineHeight: 1.6, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Para iniciar el control formal de tus prácticas preprofesionales, debes solicitar tu práctica seleccionando una empresa y sede.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                onClick={() => navigate('/estudiante/solicitar-practica')}
                sx={{
                  px: { xs: 3, sm: 5 }, py: 1.5, borderRadius: 3,
                  bgcolor: '#1a365d', fontWeight: 600,
                  width: { xs: '100%', sm: 'auto' },
                  boxShadow: '0 8px 16px -4px rgba(26, 54, 93, 0.3)',
                  '&:hover': { bgcolor: '#0f172a' }
                }}
              >
                Solicitar Práctica
              </Button>
            </Paper>
          </Box>
        </Fade>
      </Box>
    );
  }

  const horasTotales = horasData.horasRequeridas || practica.horasRequeridas || 0;
  const horasEjecutadas = horasData.horasValidadas || 0;
  const pct = horasTotales > 0 ? Math.min(100, Math.round((horasEjecutadas / horasTotales) * 100)) : 0;
  const practicaStatus = getStatusProps(practica.estado);

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2, md: 2.5 }, py: { xs: 2, md: 4 }, width: '100%' }}>
      <Fade in timeout={600}>
        <Box>
          {/* Header Banner full width y responsivo */}
          <Paper
            elevation={0}
            sx={{
              mb: 4, borderRadius: { xs: 3, md: 4 }, overflow: 'hidden',
              bgcolor: '#1a365d', color: 'white',
              display: 'flex', flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' },
              p: { xs: 3, md: 5 }, gap: { xs: 4, md: 3 },
              position: 'relative'
            }}
          >
            <Box sx={{ position: 'absolute', right: { xs: -20, md: -50 }, top: { xs: 10, md: -50 }, opacity: 0.1 }}>
              <School sx={{ fontSize: { xs: 150, md: 300 } }} />
            </Box>

            <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Button 
                  startIcon={<ArrowBack />} 
                  onClick={() => navigate('/estudiante/dashboard')}
                  sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', borderRadius: 2 }}
                  variant="outlined"
                  size="small"
                >
                  Volver
                </Button>
              </Box>
              <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 1.5, fontWeight: 600, display: 'block', mb: 0.5 }}>
                Control de Prácticas Preprofesionales
              </Typography>
              <Typography variant="h3"  sx={{ fontWeight: 800,  mt: 0, mb: 1.5, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }, wordBreak: 'break-word' }}>
                {practica.nombreTipoPractica || 'Mi Práctica'}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9, display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 0.5, sm: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business fontSize="small" /> {practica.razonSocialEmpresa || 'Empresa no asignada'}
                </Box>
                {practica.nombreSede && (
                  <>
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, opacity: 0.5 }}>|</Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn fontSize="small" /> {practica.nombreSede}
                    </Box>
                  </>
                )}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 2, alignItems: { xs: 'stretch', sm: 'center' }, width: { xs: '100%', md: 'auto' }, position: 'relative', zIndex: 1 }}>
              <Tooltip title="Actualizar información">
                <IconButton onClick={() => window.location.reload()} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, alignSelf: { xs: 'flex-end', sm: 'auto' } }}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Box sx={{ bgcolor: practicaStatus.bg, color: practicaStatus.text, px: { xs: 2, md: 3 }, py: { xs: 1.5, md: 1 }, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, fontWeight: 700, whiteSpace: 'nowrap' }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: practicaStatus.text }} />
                ESTADO: {(practicaStatus.label || 'Desconocido').toUpperCase()}
              </Box>
            </Box>
          </Paper>

          {/* KPIs - fila completa a todo el ancho */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 2, sm: 2.5 }, mb: 3 }}>
            {[
              { label: 'Horas Requeridas', val: `${horasTotales} h`, icon: AccessTime, color: '#0ea5e9', bg: '#f0f9ff' },
              { label: 'Estado', val: practicaStatus.label, icon: TaskAlt, color: '#10b981', bg: '#ecfdf5' },
              { label: 'Tipo', val: practica.codigoTipoPractica || 'Práctica', icon: Assignment, color: '#8b5cf6', bg: '#f5f3ff' },
              { label: 'Sede', val: practica.nombreSede ? (practica.nombreSede.length > 12 ? practica.nombreSede.slice(0, 12) + '...' : practica.nombreSede) : 'No asignada', icon: School, color: '#f59e0b', bg: '#fffbeb' }
            ].map((kpi, idx) => (
              <Paper
                key={idx}
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3 }, borderRadius: 4, border: '1px solid', borderColor: 'divider',
                  display: 'flex', flexDirection: 'column', gap: 2,
                  transition: 'all 0.2s ease', '&:hover': { transform: 'translateY(-2px)', borderColor: kpi.color, boxShadow: `0 8px 24px -8px ${kpi.color}30` }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>{kpi.label}</Typography>
                  <Avatar sx={{ bgcolor: kpi.bg, color: kpi.color, width: 40, height: 40 }}>
                    <kpi.icon sx={{ fontSize: 22 }} />
                  </Avatar>
                </Box>
                <Typography variant="h4"  color="text.primary" sx={{ fontWeight: 800,  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>{kpi.val}</Typography>
              </Paper>
            ))}
          </Box>

          {/* Contenido principal */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: { xs: 2, sm: 2.5 } }}>

            {/* Detalles de la Práctica */}
            <DashboardCard title="Detalles de la Práctica" sx={{ gridColumn: { xs: '1 / -1', xl: '1 / 3' } }}>
              <Grid container spacing={3} sx={{ mt: 0.5 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5, fontWeight: 700 }}>
                      Empresa
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }} variant="h6" color="#1a365d">
                      {practica.razonSocialEmpresa || 'Empresa no asignada'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5, fontWeight: 700 }}>
                      Sede
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }} variant="h6" color="#1a365d">
                      {practica.nombreSede || 'Sede no asignada'}
                    </Typography>
                  </Box>
                </Grid>

                {practica.fechaInicio && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5, fontWeight: 700 }}>
                        Fecha de Inicio
                      </Typography>
                      <Typography sx={{ fontWeight: 700 }} variant="h6" color="#1a365d">
                        {new Date(practica.fechaInicio).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {practica.fechaFin && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5, fontWeight: 700 }}>
                        Fecha de Fin
                      </Typography>
                      <Typography sx={{ fontWeight: 700 }} variant="h6" color="#1a365d">
                        {new Date(practica.fechaFin).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DashboardCard>

            {/* Control de Horas */}
            <DashboardCard title="Control de Horas">
              <Box sx={{ mt: 'auto', mb: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2 }}>
                  <Box>
                    <Typography variant="h3"  color="#1a365d" sx={{ fontWeight: 800,  lineHeight: 1, fontSize: { xs: '2.5rem', sm: '3rem' } }}>
                      {pct}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
                      Avance verificado
                    </Typography>
                  </Box>
                  <Chip label={pct >= 100 ? "Completado" : "En proceso"} color={pct >= 100 ? "success" : "primary"} sx={{ fontWeight: 600, borderRadius: 2 }} />
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{
                    height: 14,
                    borderRadius: 2,
                    bgcolor: '#f1f5f9',
                    '& .MuiLinearProgress-bar': { borderRadius: 2, bgcolor: '#1a365d' }
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, pt: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Ejecutadas</Typography>
                    <Typography sx={{ fontWeight: 700 }} variant="h6" color="text.primary">{horasEjecutadas} h</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Pendientes</Typography>
                    <Typography sx={{ fontWeight: 700 }} variant="h6" color="text.primary">{horasTotales - horasEjecutadas} h</Typography>
                  </Box>
                </Box>
              </Box>
            </DashboardCard>

            {/* Gestión Rápida */}
            <DashboardCard title="Gestión Rápida">
              <Stack spacing={2} sx={{ mt: 1 }}>
                {[
                  { title: 'Mis Documentos', sub: 'Sube y revisa archivos', icon: FolderOpen, action: () => navigate('/estudiante/documentos') },
                  { title: 'Registrar Horas', sub: 'Control de horas diarias', icon: AccessTime, action: () => navigate('/estudiante/horas') },
                  { title: 'Mis Evaluaciones', sub: 'Consulta resultados', icon: TrendingUp, action: () => navigate('/estudiante/evaluacion') }
                ].map((btn, i) => (
                  <Button
                    key={i}
                    variant="outlined"
                    fullWidth
                    onClick={btn.action}
                    sx={{
                      justifyContent: 'space-between',
                      py: 1.5, px: 2,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      color: 'text.primary',
                      '&:hover': { bgcolor: '#f8fafc', borderColor: '#1a365d', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textAlign: 'left', overflow: 'hidden' }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: '#f1f5f9', color: '#1a365d' }}>
                        <btn.icon fontSize="small" />
                      </Avatar>
                      <Box sx={{ overflow: 'hidden' }}>
                        <Typography sx={{ fontWeight: 700 }} variant="body2" noWrap>{btn.title}</Typography>
                        <Typography sx={{ display: 'block' }} variant="caption" color="text.secondary" noWrap>{btn.sub}</Typography>
                      </Box>
                    </Box>
                    <ArrowForwardIos sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }} />
                  </Button>
                ))}
              </Stack>
            </DashboardCard>

            {/* Equipo de Tutores */}
            {(practica.nombreTutorAcademico || practica.nombreTutorEmpresa) && (
              <DashboardCard title="Equipo de Tutores" sx={{ gridColumn: { xs: '1 / -1', md: '1 / 2', xl: '1 / 2' } }}>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  {practica.nombreTutorAcademico && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#1a365d', color: 'white' }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', fontWeight: 700 }}>
                            Tutor Académico
                          </Typography>
                          <Typography sx={{ fontWeight: 700 }} variant="body1" color="text.primary">
                            {practica.nombreTutorAcademico}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                  {practica.nombreTutorEmpresa && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#0d9488', color: 'white' }}>
                          <Business />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', fontWeight: 700 }}>
                            Tutor Empresarial
                          </Typography>
                          <Typography sx={{ fontWeight: 700 }} variant="body1" color="text.primary">
                            {practica.nombreTutorEmpresa}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </DashboardCard>
            )}
          </Box>
        </Box>
      </Fade>
    </Box>
  );
};

export default MiPractica;
