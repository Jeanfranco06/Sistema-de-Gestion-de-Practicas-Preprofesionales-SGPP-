import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, Chip, List, ListItem, ListItemText, ListItemIcon,
  Button, Alert, CircularProgress, IconButton, Stack, LinearProgress,
  Paper, useTheme, Tooltip, Avatar, Fade
} from '@mui/material';
import {
  Description, Business, Visibility, TrendingUp, Refresh, InfoOutlined,
  Assignment, AccessTime, FolderOpen, School, TaskAlt, PendingActions,
  ArrowForwardIos, PlayArrow
} from '@mui/icons-material';
import { useAuth } from '../../auth/AuthContext';
import { expedientesApi } from '../../api/expedientesApi';
import { useNavigate } from 'react-router-dom';
import { ModulePageShell } from '../../shared/components/module/ModulePageShell';

// Componente Card Premium responsivo
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
        {title && <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>{title}</Typography>}
        {action && <Box sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>{action}</Box>}
      </Box>
    )}
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>{children}</Box>
  </Paper>
);

const getStatusProps = (status) => {
  const map = {
    'APROBADO': { color: 'success', label: 'Aprobado', bg: '#ecfdf5', text: '#065f46' },
    'PENDIENTE': { color: 'default', label: 'Pendiente', bg: '#f1f5f9', text: '#475569' },
    'OBSERVADO': { color: 'error', label: 'Observado', bg: '#fef2f2', text: '#991b1b' },
    'EN_REVISION': { color: 'info', label: 'En Revisión', bg: '#eff6ff', text: '#1e40af' },
    'CERRADO': { color: 'default', label: 'Cerrado', bg: '#f8fafc', text: '#334155' },
    'EN_EJECUCION': { color: 'primary', label: 'En Ejecución', bg: '#eff6ff', text: '#1e40af' },
  };
  return map[status] || { color: 'default', label: status, bg: '#f1f5f9', text: '#475569' };
};

export default function DashboardEstudiante() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [expediente, setExpediente] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await expedientesApi.getMisExpedientes();
      const expedientes = res.data?.data || [];
      if (expedientes.length > 0) setExpediente(expedientes[0]);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 3 }}>
        <CircularProgress size={48} thickness={4} sx={{ color: '#1a365d' }} />
        <Typography variant="body1" color="text.secondary" fontWeight={500}>Sincronizando panel institucional...</Typography>
      </Box>
    );
  }

  if (!expediente) {
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
                <FolderOpen sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h4" fontWeight={800} color="#1a365d" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                Bienvenido al SGPP
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 5, lineHeight: 1.6, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Aún no tienes un expediente registrado. Para iniciar el control formal de tus prácticas preprofesionales en la Facultad de Ingeniería, debes aperturar tu trámite.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                sx={{
                  px: { xs: 3, sm: 5 }, py: 1.5, borderRadius: 3,
                  bgcolor: '#1a365d', fontWeight: 600,
                  width: { xs: '100%', sm: 'auto' },
                  boxShadow: '0 8px 16px -4px rgba(26, 54, 93, 0.3)',
                  '&:hover': { bgcolor: '#0f172a' }
                }}
              >
                Aperturar Nuevo Expediente
              </Button>
            </Paper>
          </Box>
        </Fade>
      </Box>
    );
  }

  const horasTotales = expediente.codigoTipoPractica === 'INICIAL' ? 120 : (expediente.codigoTipoPractica === 'FINAL' ? 180 : 200);
  const horasEjecutadas = expediente.estado === 'CERRADO' || expediente.estado === 'EVALUADO' ? horasTotales : (expediente.estado === 'EN_EJECUCION' ? Math.floor(horasTotales * 0.5) : 0);
  const pct = Math.round((horasEjecutadas / horasTotales) * 100);

  const obsActivas = expediente.observacionesList?.filter((o) => !o.subsanado) || [];
  const docsObligatorios = ['PLAN_PRACTICA', 'CARTA_ACEPTACION', 'INFORME_FINAL', 'CONSTANCIA_CULMINACION'];
  const docsSubidos = expediente.documentos?.map((d) => d.tipoDocumento) || [];
  const docsAprobados = docsObligatorios.filter((d) => docsSubidos.includes(d)).length;
  const docLabels = {
    PLAN_PRACTICA: 'Plan de prácticas',
    CARTA_ACEPTACION: 'Carta de aceptación',
    INFORME_FINAL: 'Informe final',
    CONSTANCIA_CULMINACION: 'Constancia de culminación',
  };

  const expStatus = getStatusProps(expediente.estado);

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
              <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 1.5, fontWeight: 600, display: 'block', mb: 0.5 }}>
                Panel de Control del Estudiante
              </Typography>
              <Typography variant="h3" fontWeight={800} sx={{ mt: 0, mb: 1.5, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }, wordBreak: 'break-word' }}>
                Hola, {user?.nombres?.split(' ')[0]}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9, display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 0.5, sm: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business fontSize="small" /> {expediente.nombreEmpresa || 'Empresa no asignada'}
                </Box>
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, opacity: 0.5 }}>|</Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Assignment fontSize="small" /> Modalidad: {expediente.nombreTipoPractica}
                </Box>
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 2, alignItems: { xs: 'stretch', sm: 'center' }, width: { xs: '100%', md: 'auto' }, position: 'relative', zIndex: 1 }}>
              <Tooltip title="Sincronizar Datos">
                <IconButton onClick={fetchData} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, alignSelf: { xs: 'flex-end', sm: 'auto' } }}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Box sx={{ bgcolor: expStatus.bg, color: expStatus.text, px: { xs: 2, md: 3 }, py: { xs: 1.5, md: 1 }, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, fontWeight: 700, whiteSpace: 'nowrap' }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: expStatus.text }} />
                ESTADO: {expStatus.label.toUpperCase()}
              </Box>
            </Box>
          </Paper>

          {obsActivas.length > 0 && (
            <Alert
              severity="error"
              icon={<InfoOutlined fontSize="inherit" />}
              sx={{
                mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'error.main',
                alignItems: { xs: 'flex-start', sm: 'center' }, py: 1.5, px: 3,
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)',
                flexDirection: { xs: 'column', sm: 'row' },
                '& .MuiAlert-message': { width: '100%' },
                '& .MuiAlert-action': { pt: { xs: 2, sm: 0 }, pl: { xs: 0, sm: 2 }, width: { xs: '100%', sm: 'auto' }, paddingLeft: { xs: 0, sm: 'auto' }, padding: { xs: '16px 0 0 0', sm: '0 0 0 16px' } }
              }}
              action={
                <Button color="error" variant="contained" size="small" onClick={() => navigate('/estudiante/documentos')} sx={{ borderRadius: 2, fontWeight: 600, width: { xs: '100%', sm: 'auto' } }}>
                  Revisar Observaciones
                </Button>
              }
            >
              <Typography variant="subtitle2" fontWeight={700}>Trámite detenido temporalmente</Typography>
              <Typography variant="body2">Tienes {obsActivas.length} documento(s) con observaciones que requieren tu subsanación inmediata para continuar.</Typography>
            </Alert>
          )}


          {/* KPIs - fila completa a todo el ancho */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 2, sm: 2.5 }, mb: 3 }}>
            {[
              { label: 'Horas Aprobadas', val: `${horasEjecutadas} / ${horasTotales}`, icon: AccessTime, color: '#0ea5e9', bg: '#f0f9ff' },
              { label: 'Requisitos', val: `${docsAprobados} / ${docsObligatorios.length}`, icon: Description, color: '#10b981', bg: '#ecfdf5' },
              { label: 'Última Actividad', val: expediente.fechaActualizacion?.split('T')[0] || 'Reciente', icon: TrendingUp, color: '#8b5cf6', bg: '#f5f3ff' },
              { label: 'Modalidad', val: expediente.nombreTipoPractica || expediente.codigoTipoPractica, icon: School, color: '#f59e0b', bg: '#fffbeb' }
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
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{kpi.label}</Typography>
                  <Avatar sx={{ bgcolor: kpi.bg, color: kpi.color, width: 40, height: 40 }}>
                    <kpi.icon sx={{ fontSize: 22 }} />
                  </Avatar>
                </Box>
                <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>{kpi.val}</Typography>
              </Paper>
            ))}
          </Box>

          {/* Contenido principal - 4 columnas iguales en pantallas grandes */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: { xs: 2, sm: 2.5 } }}>

            {/* Control de Horas */}
            <DashboardCard title="Control de Horas Oficiales">
              <Box sx={{ mt: 'auto', mb: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2 }}>
                  <Box>
                    <Typography variant="h3" fontWeight={800} color="#1a365d" sx={{ lineHeight: 1, fontSize: { xs: '2.5rem', sm: '3rem' } }}>
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
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>Ejecutadas</Typography>
                    <Typography variant="h6" fontWeight={700} color="text.primary">{horasEjecutadas} h</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>Pendientes</Typography>
                    <Typography variant="h6" fontWeight={700} color="text.primary">{horasTotales - horasEjecutadas} h</Typography>
                  </Box>
                </Box>
              </Box>
            </DashboardCard>

            {/* Requisitos Documentarios */}
            <DashboardCard
              title="Requisitos Documentarios"
              action={
                <Button
                  size="small"
                  endIcon={<ArrowForwardIos sx={{ fontSize: '10px !important' }} />}
                  onClick={() => navigate('/estudiante/documentos')}
                  sx={{ fontWeight: 600 }}
                >
                  Ir a gestión
                </Button>
              }
            >
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {docsObligatorios.map((docType) => {
                  const isReady = docsSubidos.includes(docType);
                  return (
                    <Box key={docType} sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: isReady ? 'success.200' : 'divider',
                      bgcolor: isReady ? 'success.50' : 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1.5,
                      transition: 'all 0.15s ease'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: isReady ? 'success.100' : '#f1f5f9', color: isReady ? 'success.main' : 'text.disabled' }}>
                          {isReady ? <TaskAlt sx={{ fontSize: 16 }} /> : <Description sx={{ fontSize: 16 }} />}
                        </Avatar>
                        <Typography variant="body2" fontWeight={isReady ? 600 : 500} color={isReady ? 'text.primary' : 'text.secondary'} noWrap>
                          {docLabels[docType]}
                        </Typography>
                      </Box>
                      <Chip
                        label={isReady ? 'Listo' : 'Pendiente'}
                        size="small"
                        sx={{
                          borderRadius: 1, fontWeight: 600, fontSize: '0.7rem', height: 22, flexShrink: 0,
                          bgcolor: isReady ? 'success.main' : '#f1f5f9',
                          color: isReady ? 'white' : 'text.secondary',
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </DashboardCard>

            {/* Gestión Rápida */}
            <DashboardCard title="Gestión Rápida">
              <Stack spacing={2} sx={{ mt: 1 }}>
                {[
                  { title: 'Mis Documentos', sub: 'Sube y revisa oficios', icon: FolderOpen, action: () => navigate('/estudiante/documentos') },
                  { title: 'Datos de Empresa', sub: 'Ver centro de práctica', icon: Business, action: () => navigate('/estudiante/sedes') },
                  { title: 'Mis Evaluaciones', sub: 'Consulta notas finales', icon: TrendingUp, action: () => navigate('/estudiante/evaluacion') }
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
                        <Typography variant="body2" fontWeight={700} noWrap>{btn.title}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block" noWrap>{btn.sub}</Typography>
                      </Box>
                    </Box>
                    <ArrowForwardIos sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }} />
                  </Button>
                ))}
              </Stack>
            </DashboardCard>

            {/* Historial de Movimientos */}
            <DashboardCard title="Historial de Movimientos">
              {(!expediente.estadoHistorial || expediente.estadoHistorial.length === 0) ? (
                <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 3, mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <InfoOutlined sx={{ color: 'text.disabled', fontSize: 40, mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Aún no se han registrado cambios de estado.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ position: 'relative', ml: 1.5, mt: 2 }}>
                  <Box sx={{ position: 'absolute', top: 16, bottom: 16, left: 15, width: 2, bgcolor: '#e2e8f0', zIndex: 0 }} />

                  <Stack spacing={0}>
                    {expediente.estadoHistorial.slice(-4).reverse().map((h, i) => (
                      <Box key={h.id} sx={{ display: 'flex', gap: 2, position: 'relative', zIndex: 1, pb: i !== expediente.estadoHistorial.slice(-4).length - 1 ? 3 : 0 }}>
                        <Box sx={{ mt: 0.5 }}>
                          <Box sx={{
                            width: 32, height: 32, borderRadius: '50%',
                            bgcolor: i === 0 ? '#1a365d' : '#f8fafc',
                            border: '4px solid white',
                            boxShadow: i === 0 ? '0 0 0 2px rgba(26,54,93,0.2)' : '0 0 0 1px #cbd5e1',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {i === 0 && <Box sx={{ width: 8, height: 8, bgcolor: 'white', borderRadius: '50%' }} />}
                          </Box>
                        </Box>
                        <Box sx={{ flexGrow: 1, pt: 0.5 }}>
                          <Typography variant="body2" fontWeight={i === 0 ? 700 : 600} color={i === 0 ? '#1a365d' : 'text.primary'}>
                            {h.estadoNuevo?.replace(/_/g, ' ')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTime sx={{ fontSize: 14 }} /> {h.fechaCambio}
                          </Typography>
                          {h.observacion && (
                            <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, borderLeft: '3px solid #cbd5e1' }}>
                              <Typography variant="caption" color="text.primary" fontWeight={500} sx={{ display: 'block', lineHeight: 1.5 }}>
                                {h.observacion}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </DashboardCard>

          </Box>
        </Box>
      </Fade>
    </Box>
  );
}
