import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Chip, Button, Alert, CircularProgress,
  IconButton, Stack, LinearProgress, List, ListItem, ListItemText, ListItemIcon, Divider,
} from '@mui/material';
import {
  PeopleAlt, PlaylistAddCheck, RateReview,
  SupervisorAccount, Refresh, Groups, ChevronRight,
  TaskAlt, PendingActions, School, Assignment,
} from '@mui/icons-material';
import { useAuth } from '../../../auth/AuthContext';
import { expedientesApi } from '../../../api/expedientesApi';
import {
  ModulePageShell, ModulePageHeader,
} from '../../../shared/components/module/ModulePageShell';
import ContentCard from '../../../shared/components/ContentCard';
import StatStrip from '../../../shared/components/StatStrip';

export default function DashboardDocente() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = () => {
    setLoading(true);
    expedientesApi.getMisExpedientes()
      .then(({ data }) => setExpedientes(data?.data ?? data ?? []))
      .catch(() => setError('No se pudieron cargar los expedientes. Verifica la conexión con el backend.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const kpis = useMemo(() => {
    const activos = expedientes.filter((e) => !['EVALUADO', 'CERRADO'].includes(e.estado));
    const finalizados = expedientes.length - activos.length;
    return {
      total: expedientes.length,
      activos: activos.length,
      finalizados,
      enEjecucion: expedientes.filter((e) => e.estado === 'EN_EJECUCION').length,
      porEvaluar: expedientes.filter((e) => ['INFORME_PARCIAL_PRESENTADO', 'INFORME_FINAL_PRESENTADO'].includes(e.estado)).length,
      observados: expedientes.filter((e) => e.estado === 'OBSERVADO').length,
      planPendiente: expedientes.filter((e) => e.estado === 'ASESOR_ASIGNADO' || e.estado === 'PLAN_PRESENTADO').length,
    };
  }, [expedientes]);

  const estadoChart = useMemo(() => ([
    { name: 'En ejecución', value: kpis.enEjecucion, color: '#3b82f6' },
    { name: 'Por evaluar', value: kpis.porEvaluar, color: '#8b5cf6' },
    { name: 'Observados', value: kpis.observados, color: '#ef4444' },
    { name: 'Plan / revisión', value: kpis.planPendiente, color: '#f59e0b' },
    {
      name: 'Otros activos',
      value: Math.max(kpis.activos - kpis.enEjecucion - kpis.porEvaluar - kpis.observados - kpis.planPendiente, 0),
      color: '#94a3b8',
    },
  ]), [kpis]);

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
      e.estado === 'OBSERVADO'
      || e.estado === 'PLAN_PRESENTADO'
      || ['INFORME_PARCIAL_PRESENTADO', 'INFORME_FINAL_PRESENTADO'].includes(e.estado),
    ),
    [expedientes],
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  const stats = [
    { label: 'Practicantes', value: kpis.total, icon: <SupervisorAccount fontSize="small" />, accent: 'blue' },
    { label: 'Activos', value: kpis.activos, icon: <PeopleAlt fontSize="small" />, accent: 'teal' },
    { label: 'En ejecución', value: kpis.enEjecucion, icon: <PlaylistAddCheck fontSize="small" />, accent: 'violet' },
    { label: 'Por evaluar', value: kpis.porEvaluar, icon: <RateReview fontSize="small" />, accent: 'emerald' },
  ];

  return (
    <ModulePageShell>
      <ModulePageHeader
        icon={<School />}
        title={`Hola, ${user?.nombres?.split(' ')[0] || 'Docente'}`}
        subtitle="Panel de asesoría · Supervisa el avance de tus practicantes"
        action={(
          <IconButton onClick={fetchData} size="small" aria-label="Actualizar">
            <Refresh fontSize="small" />
          </IconButton>
        )}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {pendientesAccion.length > 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
          action={(
            <Button size="small" onClick={() => navigate('/docente/practicantes')}>
              Revisar
            </Button>
          )}
        >
          Tienes {pendientesAccion.length} practicante(s) con acciones pendientes de tu parte.
        </Alert>
      )}

      <StatStrip items={stats} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <ContentCard accent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontWeight: 600 }} variant="subtitle1">Resumen de asesoría</Typography>
              <Chip label={`${avancePct}% finalizados`} size="small" color="primary" variant="outlined" />
            </Box>
            <LinearProgress variant="determinate" value={avancePct} sx={{ height: 10, borderRadius: 999, mb: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {kpis.finalizados} culminados · {kpis.activos} en seguimiento activo
            </Typography>

            <Grid container spacing={2.5} sx={{ mt: 1.5 }}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 1 }}>
                  Activos vs finalizados
                </Typography>
                <Box sx={{ height: 210, display: 'grid', placeItems: 'center' }}>
                  <Box
                    sx={{
                      width: 148,
                      height: 148,
                      borderRadius: '50%',
                      background: `conic-gradient(#10b981 0 ${kpis.total ? (kpis.finalizados / kpis.total) * 100 : 0}%, #e2e8f0 0 100%)`,
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <Box sx={{ width: 104, height: 104, borderRadius: '50%', bgcolor: 'background.paper', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                      <Typography sx={{ fontWeight: 700 }} variant="h5" color="success.main">{kpis.finalizados}</Typography>
                      <Typography variant="caption" color="text.secondary">de {kpis.total}</Typography>
                    </Box>
                  </Box>
                </Box>
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: -1, flexWrap: 'wrap' }}>
                  <Chip size="small" icon={<TaskAlt />} label={`${kpis.activos} activos`} color="primary" variant="outlined" />
                  <Chip size="small" icon={<PendingActions />} label={`${kpis.observados} observados`} variant="outlined" />
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 7 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 1 }}>
                  Distribución por estado
                </Typography>
                <Box sx={{ height: 210, display: 'flex', alignItems: 'end', justifyContent: 'center', gap: 1.5, px: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  {estadoChart.map((item) => {
                    const height = Math.max((item.value / maxEstado) * 160, item.value > 0 ? 16 : 4);
                    return (
                      <Box key={item.name} sx={{ width: 56, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">{item.value}</Typography>
                        <Box
                          sx={{
                            height,
                            mt: 0.75,
                            borderRadius: '8px 8px 0 0',
                            bgcolor: item.color,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontSize: '0.65rem', lineHeight: 1.2, display: 'block' }}>
                          {item.name}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              Modalidad de práctica
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'end', justifyContent: 'center', gap: 4, px: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
              {tipoChart.map((item, index) => {
                const height = Math.max((item.value / maxTipo) * 120, item.value > 0 ? 16 : 4);
                return (
                  <Box key={item.name} sx={{ width: 72, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">{item.value}</Typography>
                    <Box
                      sx={{
                        height,
                        mt: 0.75,
                        borderRadius: '8px 8px 0 0',
                        bgcolor: index === 0 ? '#3b82f6' : index === 1 ? '#8b5cf6' : '#10b981',
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {item.name}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </ContentCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <ContentCard accent>
            <Typography variant="subtitle2" color="primary.dark" sx={{ mb: 2 }}>Accesos rápidos</Typography>
            <Stack spacing={1}>
              <Button variant="outlined" color="primary" startIcon={<Groups />} onClick={() => navigate('/docente/practicantes')} sx={{ justifyContent: 'flex-start' }}>
                Mis practicantes
              </Button>
              <Button variant="outlined" color="secondary" startIcon={<RateReview />} onClick={() => navigate('/docente/practicantes')} sx={{ justifyContent: 'flex-start' }}>
                Evaluaciones pendientes
              </Button>
              <Button variant="outlined" startIcon={<Assignment />} onClick={() => navigate('/docente/practicantes')} sx={{ justifyContent: 'flex-start', borderColor: 'divider', color: 'text.primary' }}>
                Revisar planes
              </Button>
            </Stack>
          </ContentCard>

          <ContentCard sx={{ mb: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2" color="text.secondary">Practicantes recientes</Typography>
              <Button size="small" endIcon={<ChevronRight />} onClick={() => navigate('/docente/practicantes')}>
                Ver todos
              </Button>
            </Box>
            <List disablePadding dense>
              {recientes.map((e) => (
                <ListItem key={e.id} disablePadding sx={{ mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <PeopleAlt fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${e.nombreEstudiante} ${e.apellidoEstudiante}`}
                    secondary={e.nombreEmpresa || e.estado?.replace(/_/g, ' ')}
                    slotProps={{
                      primary: { variant: 'body2', fontWeight: 500 },
                      secondary: { variant: 'caption', sx: { textTransform: 'capitalize' } },
                    }}
                  />
                </ListItem>
              ))}
              {recientes.length === 0 && (
                <Typography variant="body2" color="text.secondary">No hay practicantes asignados.</Typography>
              )}
            </List>
          </ContentCard>
        </Grid>
      </Grid>
    </ModulePageShell>
  );
}
