import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Chip, Button, Alert, CircularProgress,
  IconButton, Stack, LinearProgress, List, ListItem, ListItemText, ListItemIcon,
  Paper, Tooltip, Avatar, Fade, Divider
} from '@mui/material';
import {
  Assignment, RateReview, Refresh, Groups, ChevronRight,
  TaskAlt, BusinessCenter, FolderOpen, WarningAmber, WorkspacePremium, Description,
  ArrowForwardIos
} from '@mui/icons-material';
import { useAuth } from '../../../auth/AuthContext';
import { expedientesApi } from '../../../api/expedientesApi';

// Componente Card Premium responsivo inspirado en el estudiante
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

export default function DashboardSecretaria() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = () => {
    setLoading(true);
    expedientesApi.getAll()
      .then(({ data }) => setExpedientes(data?.data ?? data ?? []))
      .catch(() => setError('No se pudieron cargar los expedientes. Verifica la conexión con el backend.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const kpis = useMemo(() => {
    const total = expedientes.length;
    const activos = expedientes.filter((e) => !['EVALUADO', 'CERRADO'].includes(e.estado));
    const finalizados = total - activos.length;
    return {
      total,
      activos: activos.length,
      finalizados,
      pendientesCarta: expedientes.filter((e) => e.estado === 'SOLICITADO' || e.estado === 'EMPRESA_SEDE_ASIGNADA').length,
      pendientesConstancia: expedientes.filter((e) => e.estado === 'EVALUADO').length,
      observados: expedientes.filter((e) => e.estado === 'OBSERVADO').length,
    };
  }, [expedientes]);

  const estadoChart = useMemo(() => ([
    { name: 'Tramite Inicial', value: kpis.pendientesCarta, color: '#3b82f6' },
    { name: 'En Ejecución', value: expedientes.filter((e) => e.estado === 'EN_EJECUCION').length, color: '#10b981' },
    { name: 'Observados', value: kpis.observados, color: '#ef4444' },
    { name: 'Para Constancia', value: kpis.pendientesConstancia, color: '#f59e0b' },
    {
      name: 'Otros activos',
      value: Math.max(kpis.activos - kpis.pendientesCarta - expedientes.filter((e) => e.estado === 'EN_EJECUCION').length - kpis.observados - kpis.pendientesConstancia, 0),
      color: '#94a3b8',
    },
  ]), [kpis, expedientes]);

  const tipoChart = useMemo(() => {
    const tipos = ['INICIAL', 'FINAL', 'PROFESIONAL'];
    return tipos.map((t) => ({
      name: t.charAt(0) + t.slice(1).toLowerCase(),
      value: expedientes.filter((e) => e.codigoTipoPractica === t).length,
    }));
  }, [expedientes]);

  const maxEstado = Math.max(...estadoChart.map((i) => i.value), 1);
  const maxTipo = Math.max(...tipoChart.map((i) => i.value), 1);
  const avancePct = kpis.total > 0 ? Math.round((kpis.finalizados / kpis.total) * 100) : 0;

  const recientes = useMemo(
    () => [...expedientes].slice(0, 5),
    [expedientes],
  );

  const pendientesAccion = useMemo(
    () => expedientes.filter((e) =>
      e.estado === 'SOLICITADO' || e.estado === 'EVALUADO'
    ),
    [expedientes],
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 3 }}>
        <CircularProgress size={48} thickness={4} sx={{ color: '#1a365d' }} />
        <Typography sx={{ fontWeight: 500 }} variant="body1" color="text.secondary">Cargando panel administrativo...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2, md: 2.5 }, py: { xs: 2, md: 4 }, width: '100%', pb: 8 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Header Banner Premium */}
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
            <Box sx={{ position: 'absolute', right: { xs: -20, md: 20 }, top: { xs: 10, md: -20 }, opacity: 0.1 }}>
              <BusinessCenter sx={{ fontSize: { xs: 150, md: 220 } }} />
            </Box>

            <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
              <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 1.5, fontWeight: 600, display: 'block', mb: 0.5 }}>
                Panel Administrativo
              </Typography>
              <Typography variant="h3"  sx={{ fontWeight: 800,  mt: 0, mb: 1.5, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }, wordBreak: 'break-word' }}>
                Hola, {user?.nombres?.split(' ')[0] || 'Secretaría'}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                Gestión de trámites, emisión de documentos y validación de requisitos
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', position: 'relative', zIndex: 1, alignSelf: { xs: 'flex-end', md: 'center' } }}>
              <Tooltip title="Actualizar Datos">
                <IconButton onClick={fetchData} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)' }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {pendientesAccion.length > 0 && (
            <Alert
              severity="warning"
              icon={<WarningAmber fontSize="inherit" />}
              sx={{
                mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'warning.main',
                alignItems: { xs: 'flex-start', sm: 'center' }, py: 1.5, px: 3,
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)',
                flexDirection: { xs: 'column', sm: 'row' },
                '& .MuiAlert-message': { width: '100%' },
                '& .MuiAlert-action': { pt: { xs: 2, sm: 0 }, pl: { xs: 0, sm: 2 }, width: { xs: '100%', sm: 'auto' }, padding: { xs: '16px 0 0 0', sm: '0 0 0 16px' } }
              }}
              action={
                <Button color="warning" variant="contained" size="small" onClick={() => navigate('/secretaria/recepcion')} sx={{ borderRadius: 2, fontWeight: 600, width: { xs: '100%', sm: 'auto' } }}>
                  Gestionar Ahora
                </Button>
              }
            >
              <Typography sx={{ fontWeight: 700 }} variant="subtitle2">Atención requerida</Typography>
              <Typography variant="body2">Hay {pendientesAccion.length} trámite(s) pendientes de atención documental rápida.</Typography>
            </Alert>
          )}

          {/* KPIs */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: { xs: 2, sm: 2.5 }, mb: 4 }}>
            {[
              { label: 'Total Expedientes', val: kpis.total, icon: FolderOpen, color: '#0ea5e9', bg: '#f0f9ff' },
              { label: 'Trámites Activos', val: kpis.activos, icon: Assignment, color: '#10b981', bg: '#ecfdf5' },
              { label: 'Cartas Pendientes', val: kpis.pendientesCarta, icon: Description, color: '#8b5cf6', bg: '#f5f3ff' },
              { label: 'Constancias Pendientes', val: kpis.pendientesConstancia, icon: WorkspacePremium, color: '#f59e0b', bg: '#fffbeb' }
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

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' }, gap: { xs: 2, sm: 2.5 } }}>

            {/* Columna Izquierda (Resumen Gráfico) */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5 }, gridColumn: { lg: 'span 2' } }}>
              <DashboardCard
                title="Estado Global de Expedientes"
                action={<Chip label={`${avancePct}% cerrados`} size="small" color="primary" sx={{ fontWeight: 600, borderRadius: 2 }} />}
              >
                <LinearProgress
                  variant="determinate"
                  value={avancePct}
                  sx={{
                    height: 12, borderRadius: 2, mb: 1.5,
                    bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { borderRadius: 2, bgcolor: '#1a365d' }
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
                  {kpis.finalizados} trámites finalizados satisfactoriamente de un total de {kpis.total}. Actualmente hay {kpis.activos} en proceso.
                </Typography>

                <Grid container spacing={4} sx={{ flexGrow: 1, alignItems: 'center' }}>
                  {/* Gráfico Circular de Trámites */}
                  <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="subtitle2" color="text.primary" sx={{ mb: 3, fontWeight: 700 }}>
                      Tasa de Finalización
                    </Typography>
                    <Box sx={{ position: 'relative', width: 180, height: 180, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Box
                        sx={{
                          position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
                          background: `conic-gradient(#10b981 0 ${kpis.total ? (kpis.finalizados / kpis.total) * 100 : 0}%, #f1f5f9 0 100%)`,
                          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
                        }}
                      />
                      <Box sx={{
                        position: 'relative', width: 140, height: 140, borderRadius: '50%', bgcolor: 'background.paper',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                      }}>
                        <Typography sx={{ fontWeight: 800 }} variant="h4" color="#1a365d">{kpis.finalizados}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Completados</Typography>
                      </Box>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ mt: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                      <Chip size="small" icon={<TaskAlt sx={{ fontSize: 16 }} />} label={`${kpis.activos} activos`} sx={{ bgcolor: '#eff6ff', color: '#1e40af', fontWeight: 600, '& .MuiChip-icon': { color: '#1e40af' } }} />
                      {kpis.observados > 0 && <Chip size="small" icon={<WarningAmber sx={{ fontSize: 16 }} />} label={`${kpis.observados} observados`} sx={{ bgcolor: '#fef2f2', color: '#991b1b', fontWeight: 600, '& .MuiChip-icon': { color: '#991b1b' } }} />}
                    </Stack>
                  </Grid>

                  {/* Gráfico de Barras de Distribución */}
                  <Grid size={{ xs: 12, md: 7 }}>
                    <Typography variant="subtitle2" color="text.primary" sx={{ mb: 3, textAlign: 'center', fontWeight: 700 }}>
                      Distribución por Etapa
                    </Typography>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1, px: 2, borderBottom: '2px solid', borderColor: '#e2e8f0' }}>
                      {estadoChart.map((item) => {
                        const heightPct = (item.value / maxEstado) * 100;
                        return (
                          <Box key={item.name} sx={{ width: '18%', display: 'flex', flexDirection: 'column', alignItems: 'center', group: 'true' }}>
                            <Typography sx={{ fontWeight: 700 }} variant="caption" color="text.primary" sx={{ mb: 1, opacity: item.value> 0 ? 1 : 0.4 }}>
                              {item.value}
                            </Typography>
                            <Box sx={{ width: '100%', height: 180, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                              <Box
                                sx={{
                                  width: '80%', height: `${Math.max(heightPct, item.value > 0 ? 10 : 2)}%`,
                                  bgcolor: item.color, borderRadius: '6px 6px 0 0',
                                  transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                  boxShadow: `0 4px 12px ${item.color}40`,
                                  opacity: 0.9, '&:hover': { opacity: 1 }
                                }}
                              />
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, fontSize: '0.65rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.2, height: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                              {item.name}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Grid>
                </Grid>
              </DashboardCard>

              {/* Expedientes por Modalidad */}
              <DashboardCard title="Distribución por Modalidad">
                <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: 2, px: 2, height: 140, borderBottom: '2px solid', borderColor: '#e2e8f0', mt: 2 }}>
                  {tipoChart.map((item, index) => {
                    const heightPct = (item.value / maxTipo) * 100;
                    const colors = ['#3b82f6', '#8b5cf6', '#10b981'];
                    const color = colors[index];
                    return (
                      <Box key={item.name} sx={{ width: '25%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 700 }} variant="subtitle2" color="text.primary" sx={{ mb: 1, opacity: item.value> 0 ? 1 : 0.4 }}>
                          {item.value}
                        </Typography>
                        <Box sx={{ width: '100%', height: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                          <Box
                            sx={{
                              width: '100%', maxWidth: 48, height: `${Math.max(heightPct, item.value > 0 ? 15 : 4)}%`,
                              bgcolor: color, borderRadius: '6px 6px 0 0',
                              boxShadow: `0 4px 12px ${color}40`
                            }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, fontWeight: 700 }}>
                          {item.name}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </DashboardCard>
            </Box>

            {/* Columna Derecha */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5 } }}>
              {/* Acciones Rápidas */}
              <DashboardCard title="Accesos Rápidos">
                <Stack spacing={2} sx={{ mt: 1 }}>
                  {[
                    { title: 'Recepción Administrativa', sub: 'Procesar documentos', icon: Description, action: () => navigate('/secretaria/recepcion') },
                    { title: 'Validar Requisitos', sub: 'Revisión de estudiantes', icon: RateReview, action: () => navigate('/admin/validar-requisitos') },
                    { title: 'Explorar Expedientes', sub: 'Todos los trámites', icon: FolderOpen, action: () => navigate('/admin/expedientes') }
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

              {/* Últimos Registros */}
              <DashboardCard
                title="Últimos Registros"
                action={<Button size="small" endIcon={<ChevronRight />} onClick={() => navigate('/admin/expedientes')} sx={{ fontWeight: 600 }}>Ver todos</Button>}
              >
                <List disablePadding>
                  {recientes.map((e, index) => (
                    <React.Fragment key={e.id}>
                      {index > 0 && <Divider variant="inset" component="li" />}
                      <ListItem alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 48 }}>
                          <Avatar sx={{ bgcolor: '#eff6ff', color: '#1e40af', width: 36, height: 36 }}>
                            <Groups fontSize="small" />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={`${e.nombreEstudiante} ${e.apellidoEstudiante}`}
                          secondary={e.estado?.replace(/_/g, ' ')}
                          slotProps={{
                            primary: { variant: 'body2', fontWeight: 600, color: 'text.primary' },
                            secondary: { variant: 'caption', sx: { textTransform: 'capitalize', color: 'text.secondary', fontWeight: 500, mt: 0.5, display: 'block' } },
                          }}
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                  {recientes.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">No hay expedientes recientes.</Typography>
                    </Box>
                  )}
                </List>
              </DashboardCard>
            </Box>

          </Box>
        </Box>
      </Fade>
    </Box>
  );
}
