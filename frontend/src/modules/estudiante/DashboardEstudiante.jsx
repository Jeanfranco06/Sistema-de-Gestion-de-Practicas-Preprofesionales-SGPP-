import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, Chip, List, ListItem, ListItemText, ListItemIcon,
  Button, Divider, Alert, CircularProgress, IconButton, Stack, LinearProgress,
} from '@mui/material';
import {
  Description, Business, Visibility, TrendingUp, Refresh, InfoOutlined,
  Assignment, AccessTime, FolderOpen, School, TaskAlt, PendingActions,
} from '@mui/icons-material';
import { useAuth } from '../../auth/AuthContext';
import { expedientesApi } from '../../api/expedientesApi';
import { useNavigate } from 'react-router-dom';
import {
  ModulePageShell, ModulePageHeader,
} from '../../shared/components/module/ModulePageShell';
import ContentCard from '../../shared/components/ContentCard';
import StatStrip from '../../shared/components/StatStrip';
import StatusChip from '../../shared/components/StatusChip';

export default function DashboardEstudiante() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (!expediente) {
    return (
      <ModulePageShell>
        <ContentCard>
          <Typography variant="h6" gutterBottom>Sin práctica registrada</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Solicita el inicio de tus prácticas para comenzar a registrar tu progreso.
          </Typography>
          <Button variant="contained">Solicitar práctica</Button>
        </ContentCard>
      </ModulePageShell>
    );
  }

  const horasTotales = expediente.codigoTipoPractica === 'INICIAL' ? 120 : (expediente.codigoTipoPractica === 'FINAL' ? 180 : 200);
  const horasEjecutadas = expediente.estado === 'CERRADO' || expediente.estado === 'EVALUADO'
    ? horasTotales
    : (expediente.estado === 'EN_EJECUCION' ? Math.floor(horasTotales * 0.5) : 0);
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

  const stats = [
    { label: 'Modalidad', value: expediente.codigoTipoPractica, icon: <Assignment fontSize="small" />, accent: 'blue' },
    { label: 'Horas', value: `${horasEjecutadas} / ${horasTotales}`, icon: <AccessTime fontSize="small" />, accent: 'teal' },
    { label: 'Estado', value: expediente.estado?.replace(/_/g, ' ').toLowerCase(), icon: <FolderOpen fontSize="small" />, accent: 'violet' },
    { label: 'Documentos', value: `${docsAprobados} / ${docsObligatorios.length}`, icon: <Description fontSize="small" />, accent: 'emerald' },
  ];

  const horasChart = [
    { name: 'Ejecutadas', horas: horasEjecutadas },
    { name: 'Restantes', horas: Math.max(horasTotales - horasEjecutadas, 0) },
  ];

  return (
    <ModulePageShell>
      <ModulePageHeader
        icon={<School />}
        title={`Hola, ${user?.nombres?.split(' ')[0]}`}
        subtitle={`${expediente.nombreTipoPractica} · ${expediente.nombreEmpresa || 'Empresa no asignada'}`}
        action={
          <IconButton onClick={fetchData} size="small" aria-label="Actualizar">
            <Refresh fontSize="small" />
          </IconButton>
        }
      />

      {obsActivas.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}
          action={<Button size="small" onClick={() => navigate('/estudiante/documentos')}>Resolver</Button>}>
          Tienes {obsActivas.length} observación(es) pendiente(s).
        </Alert>
      )}

      <StatStrip items={stats} />

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <ContentCard accent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>Progreso de práctica</Typography>
              <Chip label={`${pct}%`} size="small" color="primary" variant="outlined" />
            </Box>
            <LinearProgress variant="determinate" value={pct} sx={{ height: 10, borderRadius: 999, mb: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {horasEjecutadas} hrs ejecutadas · {horasTotales - horasEjecutadas} hrs restantes
            </Typography>

            <Grid container spacing={2.5} sx={{ mt: 1.5 }}>
              <Grid item xs={12} md={5}>
                <Box sx={{ height: 210, display: 'grid', placeItems: 'center' }}>
                  <Box
                    sx={{
                      width: 148,
                      height: 148,
                      borderRadius: '50%',
                      background: `conic-gradient(#10b981 0 ${docsAprobados / docsObligatorios.length * 100}%, #e2e8f0 0 100%)`,
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <Box sx={{ width: 104, height: 104, borderRadius: '50%', bgcolor: 'background.paper', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={700} color="success.main">{docsAprobados}</Typography>
                      <Typography variant="caption" color="text.secondary">de {docsObligatorios.length}</Typography>
                    </Box>
                  </Box>
                </Box>
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: -1, flexWrap: 'wrap' }}>
                  <Chip size="small" icon={<TaskAlt />} label={`${docsAprobados} listos`} color="success" variant="outlined" />
                  <Chip size="small" icon={<PendingActions />} label={`${docsObligatorios.length - docsAprobados} pendientes`} variant="outlined" />
                </Stack>
              </Grid>
              <Grid item xs={12} md={7}>
                <Box sx={{ height: 210, display: 'flex', alignItems: 'end', justifyContent: 'center', gap: 3, px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                  {horasChart.map((item, index) => {
                    const height = Math.max((item.horas / horasTotales) * 160, item.horas > 0 ? 16 : 4);
                    return (
                      <Box key={item.name} sx={{ width: 88, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">{item.horas} h</Typography>
                        <Box
                          sx={{
                            height,
                            mt: 0.75,
                            borderRadius: '8px 8px 0 0',
                            bgcolor: index === 0 ? '#3b82f6' : '#cbd5e1',
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
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
              Documentos requeridos
            </Typography>
            <Stack spacing={1}>
              {docsObligatorios.map((docType) => {
                const listo = docsSubidos.includes(docType);
                return (
                  <Box
                    key={docType}
                    sx={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      py: 1.25, px: 1.5, borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: listo ? 'success.light' : 'divider',
                      bgcolor: listo ? 'success.light' : 'background.paper',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Description fontSize="small" sx={{ color: listo ? 'success.main' : 'text.disabled' }} />
                      <Typography variant="body2">{docLabels[docType] || docType}</Typography>
                    </Box>
                    <StatusChip status={listo ? 'APROBADO' : 'PENDIENTE'} label={listo ? 'Listo' : 'Pendiente'} />
                  </Box>
                );
              })}
            </Stack>
          </ContentCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <ContentCard accent>
            <Typography variant="subtitle2" color="primary.dark" sx={{ mb: 2 }}>Accesos rápidos</Typography>
            <Stack spacing={1}>
              <Button variant="outlined" color="primary" startIcon={<Visibility />} onClick={() => navigate('/estudiante/documentos')} sx={{ justifyContent: 'flex-start' }}>
                Gestionar documentos
              </Button>
              <Button variant="outlined" color="secondary" startIcon={<Business />} onClick={() => navigate('/estudiante/sedes')} sx={{ justifyContent: 'flex-start' }}>
                Información de empresa
              </Button>
              <Button variant="outlined" startIcon={<TrendingUp />} onClick={() => navigate('/estudiante/evaluacion')} sx={{ justifyContent: 'flex-start', borderColor: 'divider', color: 'text.primary' }}>
                Ver evaluaciones
              </Button>
            </Stack>
          </ContentCard>

          <ContentCard sx={{ mb: 0 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>Historial reciente</Typography>
            <List disablePadding dense>
              {expediente.estadoHistorial?.slice(-4).reverse().map((h) => (
                <ListItem key={h.id} disablePadding sx={{ mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <InfoOutlined fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={h.estadoNuevo?.replace(/_/g, ' ')}
                    secondary={h.observacion || h.fechaCambio}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500, textTransform: 'capitalize' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
              {(!expediente.estadoHistorial || expediente.estadoHistorial.length === 0) && (
                <Typography variant="body2" color="text.secondary">Sin actualizaciones.</Typography>
              )}
            </List>
          </ContentCard>
        </Grid>
      </Grid>
    </ModulePageShell>
  );
}
