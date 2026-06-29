import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
  Chip, TextField, Button, Alert, CircularProgress,
  Grid, Tooltip, Stack, LinearProgress, List, ListItem, ListItemText, ListItemIcon,
} from '@mui/material';
import {
  PeopleAlt, PlaylistAddCheck, RateReview, Business,
  Visibility, Assignment, Refresh, ChevronRight, Groups,
} from '@mui/icons-material';
import { useAuth } from '../../../auth/AuthContext';
import { expedientesApi } from '../../../api/expedientesApi';
import {
  ModulePageShell, ModulePageHeader,
} from '../../../shared/components/module/ModulePageShell';
import ContentCard from '../../../shared/components/ContentCard';
import StatStrip from '../../../shared/components/StatStrip';
import StatusChip from '../../../shared/components/StatusChip';

export default function DashboardTutor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = () => {
    setLoading(true);
    expedientesApi.getMisExpedientes()
      .then(({ data }) => setExpedientes(data?.data ?? data ?? []))
      .catch(() => setError('No se pudieron cargar los expedientes.'))
      .finally(() => setLoading(false));
  };

  const estadoLabel = (estado) => estado?.replace(/_/g, ' ').toLowerCase() || 'Pendiente';

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => expedientes.filter(e => {
    const q = searchTerm.toLowerCase();
    return !q || (e.nombreEstudiante + ' ' + e.apellidoEstudiante).toLowerCase().includes(q)
      || e.codigoExpediente?.toLowerCase().includes(q)
      || e.nombreEmpresa?.toLowerCase().includes(q);
  }), [expedientes, searchTerm]);

  const kpis = useMemo(() => ({
    total: expedientes.length,
    enEjecucion: expedientes.filter(e => e.estado === 'EN_EJECUCION').length,
    porEvaluar: expedientes.filter(e => e.estado === 'INFORME_FINAL_PRESENTADO').length,
    empresas: new Set(expedientes.map(e => e.idEmpresa).filter(Boolean)).size,
  }), [expedientes]);

  const estadoChart = useMemo(() => ([
    { name: 'En Ejecución', value: kpis.enEjecucion, color: '#10b981' },
    { name: 'Por Evaluar', value: kpis.porEvaluar, color: '#f59e0b' },
    { name: 'Evaluados', value: expedientes.filter(e => e.estado === 'EVALUADO').length, color: '#3b82f6' },
    {
      name: 'Otros',
      value: kpis.total - kpis.enEjecucion - kpis.porEvaluar - expedientes.filter(e => e.estado === 'EVALUADO').length,
      color: '#94a3b8',
    },
  ]), [kpis, expedientes]);

  const maxEstado = Math.max(...estadoChart.map((i) => i.value), 1);
  const avancePct = kpis.total > 0 ? Math.round(((kpis.enEjecucion + expedientes.filter(e => e.estado === 'EVALUADO').length) / kpis.total) * 100) : 0;

  const recientes = useMemo(
    () => [...expedientes].slice(0, 5),
    [expedientes],
  );

  const pendientesAccion = useMemo(
    () => expedientes.filter((e) =>
      e.estado === 'INFORME_FINAL_PRESENTADO'
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
    { label: 'Practicantes', value: kpis.total, icon: <PeopleAlt fontSize="small" />, accent: 'blue' },
    { label: 'En Ejecución', value: kpis.enEjecucion, icon: <PlaylistAddCheck fontSize="small" />, accent: 'teal' },
    { label: 'Por Evaluar', value: kpis.porEvaluar, icon: <RateReview fontSize="small" />, accent: 'violet' },
    { label: 'Empresas', value: kpis.empresas, icon: <Business fontSize="small" />, accent: 'emerald' },
  ];

  return (
    <ModulePageShell>
      <ModulePageHeader
        icon={<Business />}
        title={`Hola, ${user?.nombres?.split(' ')[0] || 'Tutor'}`}
        subtitle="Panel del Tutor Externo · Seguimiento de practicantes y evaluaciones"
        action={(
          <Button variant="outlined" size="small" onClick={fetchData} startIcon={<Refresh />}>
            Actualizar
          </Button>
        )}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {pendientesAccion.length > 0 && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          action={(
            <Button size="small" onClick={() => navigate('/tutor/evaluaciones')}>
              Gestionar
            </Button>
          )}
        >
          Hay {pendientesAccion.length} evaluación(es) pendiente(s).
        </Alert>
      )}

      <StatStrip items={stats} />

      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} lg={8}>
          <ContentCard accent sx={{ height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>Resumen de Evaluaciones</Typography>
              <Chip label={`${avancePct}% en curso`} size="small" color="primary" variant="outlined" />
            </Box>
            <LinearProgress variant="determinate" value={avancePct} sx={{ height: 10, borderRadius: 999, mb: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {kpis.enEjecucion + expedientes.filter(e => e.estado === 'EVALUADO').length} practicantes en curso · {kpis.porEvaluar} pendientes de evaluación
            </Typography>

            <Grid container spacing={2.5} sx={{ mt: 1.5 }}>
              <Grid item xs={12} md={5}>
                <Typography variant="caption" color="text.secondary" display="block" textAlign="center" sx={{ mb: 1 }}>
                  Evaluaciones vs Pendientes
                </Typography>
                <Box sx={{ height: 210, display: 'grid', placeItems: 'center' }}>
                  <Box
                    sx={{
                      width: 148,
                      height: 148,
                      borderRadius: '50%',
                      background: `conic-gradient(#10b981 0 ${kpis.total ? ((expedientes.filter(e => e.estado === 'EVALUADO').length) / kpis.total) * 100 : 0}%, #f59e0b 0 ${kpis.total ? ((expedientes.filter(e => e.estado === 'EVALUADO').length + kpis.porEvaluar) / kpis.total) * 100 : 0}%, #e2e8f0 0 100%)`,
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <Box sx={{ width: 104, height: 104, borderRadius: '50%', bgcolor: 'background.paper', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={700} color="success.main">{kpis.enEjecucion + expedientes.filter(e => e.estado === 'EVALUADO').length}</Typography>
                      <Typography variant="caption" color="text.secondary">de {kpis.total}</Typography>
                    </Box>
                  </Box>
                </Box>
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: -1, flexWrap: 'wrap' }}>
                  <Chip size="small" icon={<PeopleAlt />} label={`${kpis.total} total`} color="primary" variant="outlined" />
                  <Chip size="small" icon={<RateReview />} label={`${kpis.porEvaluar} pendientes`} variant="outlined" />
                </Stack>
              </Grid>

              <Grid item xs={12} md={7}>
                <Typography variant="caption" color="text.secondary" display="block" textAlign="center" sx={{ mb: 1 }}>
                  Distribución de Estados
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
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, fontSize: '0.65rem', lineHeight: 1.2 }}>
                          {item.name}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Grid>
            </Grid>

          </ContentCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <ContentCard accent sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="primary.dark" sx={{ mb: 2 }}>Accesos rápidos</Typography>
            <Stack spacing={1}>
              <Button variant="outlined" color="primary" startIcon={<Assignment />} onClick={() => navigate('/tutor/evaluaciones')} sx={{ justifyContent: 'flex-start' }}>
                Mis Evaluaciones
              </Button>
              <Button variant="outlined" startIcon={<PeopleAlt />} onClick={() => navigate('/tutor/dashboard')} sx={{ justifyContent: 'flex-start', borderColor: 'divider', color: 'text.primary' }}>
                Ver Practicantes
              </Button>
            </Stack>
          </ContentCard>

          <ContentCard sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2" color="text.secondary">Últimos Practicantes</Typography>
              <Button size="small" endIcon={<ChevronRight />} onClick={() => {}}>
                Ver todos
              </Button>
            </Box>
            <List disablePadding dense>
              {recientes.map((e) => (
                <ListItem key={e.id} disablePadding sx={{ mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <Groups fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${e.nombreEstudiante} ${e.apellidoEstudiante}`}
                    secondary={e.estado?.replace(/_/g, ' ')}
                    slotProps={{
                      primary: { variant: 'body2', fontWeight: 500 },
                      secondary: { variant: 'caption', sx: { textTransform: 'capitalize' } },
                    }}
                  />
                </ListItem>
              ))}
              {recientes.length === 0 && (
                <Typography variant="body2" color="text.secondary">No hay practicantes recientes.</Typography>
              )}
            </List>
          </ContentCard>
        </Grid>
      </Grid>

      <ContentCard accent>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Mis Practicantes Asignados</Typography>

        <Box sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <TextField
            label="Buscar practicante"
            placeholder="Nombre, código o empresa"
            size="small"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
            sx={{ minWidth: 300 }}
          />
        </Box>

        <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Estudiante</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Empresa / Sede</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(e => (
                <TableRow key={e.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{e.nombreEstudiante} {e.apellidoEstudiante}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{e.codigoExpediente}</Typography>
                  </TableCell>
                  <TableCell><Chip label={e.nombreTipoPractica} size="small" color="primary" variant="outlined" /></TableCell>
                  <TableCell><StatusChip status={e.estado} label={estadoLabel(e.estado)} /></TableCell>
                  <TableCell>
                    <Typography variant="caption" display="block">{e.nombreEmpresa || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">{e.nombreSede || ''}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Ver detalle">
                        <Button size="small" variant="outlined" onClick={() => navigate(`/coordinacion/expedientes/${e.id}`)}>
                          <Visibility fontSize="small" />
                        </Button>
                      </Tooltip>
                      {e.estado === 'EN_EJECUCION' && (
                        <Tooltip title="Evaluar desempeño">
                          <Button size="small" variant="contained" color="secondary"
                            onClick={() => navigate(`/tutor/evaluaciones/${e.id}`)}>
                            <Assignment fontSize="small" />
                          </Button>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>No se encontraron practicantes asignados</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div"
            count={filtered.length} rowsPerPage={rowsPerPage} page={page}
            onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0); }} />
        </TableContainer>
      </ContentCard>

    </ModulePageShell>
  );
}
