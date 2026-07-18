import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
  Chip, TextField, MenuItem, Button, Alert, CircularProgress,
  Grid, Tooltip, Stack, LinearProgress, List, ListItem, ListItemText, ListItemIcon,
} from '@mui/material';
import { Description } from '@mui/icons-material';
import {
  PeopleAlt, Assignment, PlaylistAddCheck, WarningAmber,
  RateReview, Business, Refresh,
  ChevronRight, Apartment, Visibility,
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { useAuth } from '../../../auth/AuthContext';
import { hasAnyRole } from '../../../shared/utils/roleRoutes';
import { expedientesApi } from '../../../api/expedientesApi';
import { coordinacionApi } from '../../../api/coordinacionApi';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);
import {
  ModulePageShell, ModulePageHeader,
} from '../../../shared/components/module/ModulePageShell';
import ContentCard from '../../../shared/components/ContentCard';
import StatStrip from '../../../shared/components/StatStrip';
import StatusChip from '../../../shared/components/StatusChip';

const ESTADOS = [
  'SOLICITADO', 'EMPRESA_SEDE_ASIGNADA', 'VALIDADO_SECRETARIA', 'CARTA_PRESENTACION_EMITIDA',
  'ASESOR_ASIGNADO', 'COMITE_ASIGNADO',
  'CARTA_ACEPTACION_PRESENTADA', 'PLAN_PRESENTADO', 'EN_REVISION', 'OBSERVADO',
  'SUBSANADO', 'APROBADO', 'EN_EJECUCION', 'INFORME_PARCIAL_PRESENTADO',
  'INFORME_FINAL_PRESENTADO', 'EVALUADO', 'CERRADO',
];

const ESTADO_COLOR = {
  SOLICITADO: '#94a3b8', EMPRESA_SEDE_ASIGNADA: '#3b82f6',
  VALIDADO_SECRETARIA: '#10b981', CARTA_PRESENTACION_EMITIDA: '#6366f1',
  ASESOR_ASIGNADO: '#3b82f6', COMITE_ASIGNADO: '#3b82f6',
  CARTA_ACEPTACION_PRESENTADA: '#3b82f6', PLAN_PRESENTADO: '#eab308',
  EN_REVISION: '#eab308', OBSERVADO: '#ef4444', SUBSANADO: '#f59e0b',
  APROBADO: '#22c55e', EN_EJECUCION: '#6366f1',
  INFORME_PARCIAL_PRESENTADO: '#06b6d4', INFORME_FINAL_PRESENTADO: '#06b6d4',
  EVALUADO: '#22c55e', CERRADO: '#64748b',
};

const CHART_COLORS = ['#2563eb', '#0d9488', '#eab308', '#ef4444', '#6366f1', '#ec4899', '#f97316', '#06b6d4'];

export const DashboardCoordinacion = () => {
  const { user } = useAuth();
  const puedeEmitirCarta = hasAnyRole(user?.roles, ['ADMIN_SISTEMA', 'COORDINADOR', 'DIRECTOR']);
  const navigate = useNavigate();
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  const handleEmitirCarta = async (id) => {
    try {
      const res = await MySwal.fire({
        title: 'Emitir Carta de Presentación',
        text: '¿Estás seguro de emitir y firmar la Carta de Presentación para este expediente?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, emitir',
        cancelButtonText: 'Cancelar',
      });
      if (res.isConfirmed) {
        await coordinacionApi.emitirCartaPresentacion(id);
        MySwal.fire('Éxito', 'Carta de Presentación emitida y firmada electrónicamente.', 'success');
        fetchData();
      }
    } catch {
      MySwal.fire('Error', 'No se pudo emitir la Carta de Presentación.', 'error');
    }
  };

  const fetchData = () => {
    setLoading(true);
    expedientesApi.getAll()
      .then(({ data }) => setExpedientes(data?.data ?? data ?? []))
      .catch(() => setError('No se pudieron cargar los expedientes. Verifica la conexión.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => expedientes.filter(e => {
    const q = searchTerm.toLowerCase();
    return (!q || e.nombreEstudiante?.toLowerCase().includes(q) || e.apellidoEstudiante?.toLowerCase().includes(q) || e.codigoExpediente?.toLowerCase().includes(q))
      && (filtroTipo === 'TODOS' || e.codigoTipoPractica === filtroTipo)
      && (filtroEstado === 'TODOS' || e.estado === filtroEstado);
  }), [expedientes, searchTerm, filtroTipo, filtroEstado]);

  const kpis = useMemo(() => ({
    total: expedientes.length,
    activos: expedientes.filter(e => !['EVALUADO', 'CERRADO'].includes(e.estado)).length,
    cerrados: expedientes.filter(e => e.estado === 'CERRADO').length,
    enEjecucion: expedientes.filter(e => e.estado === 'EN_EJECUCION').length,
    observados: expedientes.filter(e => e.estado === 'OBSERVADO').length,
    pendientesCarta: expedientes.filter(e => e.estado === 'VALIDADO_SECRETARIA').length,
    planPendiente: expedientes.filter(e => ['ASESOR_ASIGNADO', 'COMITE_ASIGNADO', 'CARTA_ACEPTACION_PRESENTADA'].includes(e.estado)).length,
    porEvaluar: expedientes.filter(e => ['INFORME_PARCIAL_PRESENTADO', 'INFORME_FINAL_PRESENTADO'].includes(e.estado)).length,
  }), [expedientes]);

  const tiposChart = useMemo(() => {
    const map = {};
    expedientes.forEach(e => { const k = e.nombreTipoPractica || e.codigoTipoPractica || 'Otro'; map[k] = (map[k] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expedientes]);

  const estadosChart = useMemo(() => {
    const order = ['SOLICITADO', 'PLAN_PRESENTADO', 'EN_REVISION', 'OBSERVADO', 'APROBADO', 'EN_EJECUCION', 'INFORME_FINAL_PRESENTADO', 'EVALUADO', 'CERRADO'];
    const map = {};
    order.forEach(s => map[s] = 0);
    expedientes.forEach(e => { if (map[e.estado] !== undefined) map[e.estado]++; });
    return Object.entries(map).filter(([, v]) => v > 0).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
  }, [expedientes]);

  const alertas = useMemo(() => {
    const items = [];
    expedientes.filter(e => e.estado === 'OBSERVADO').forEach(e => {
      items.push({ tipo: 'Observado', exp: e.codigoExpediente, estudiante: `${e.nombreEstudiante} ${e.apellidoEstudiante}`, severity: 'error' });
    });
    expedientes.filter(e => e.estado === 'EN_REVISION').forEach(e => {
      items.push({ tipo: 'En revisión', exp: e.codigoExpediente, estudiante: `${e.nombreEstudiante} ${e.apellidoEstudiante}`, severity: 'warning' });
    });
    return items.slice(0, 10);
  }, [expedientes]);

  const estadoLabel = (estado) => estado?.replace(/_/g, ' ').toLowerCase() || 'Pendiente';
  const avancePct = kpis.total > 0 ? Math.round((kpis.cerrados / kpis.total) * 100) : 0;
  const recientes = useMemo(() => [...expedientes].slice(0, 5), [expedientes]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress size={32} /></Box>;
  }

  const stats = [
    { label: 'Total', value: kpis.total, icon: <PeopleAlt fontSize="small" />, accent: 'blue' },
    { label: 'Activos', value: kpis.activos, icon: <PlaylistAddCheck fontSize="small" />, accent: 'teal' },
    { label: 'Pendientes carta', value: kpis.pendientesCarta, icon: <Description fontSize="small" />, accent: 'violet' },
    { label: 'Plan pendiente', value: kpis.planPendiente, icon: <Assignment fontSize="small" />, accent: 'emerald' },
    { label: 'Por evaluar', value: kpis.porEvaluar, icon: <RateReview fontSize="small" />, accent: 'orange' },
  ];

  return (
    <ModulePageShell>
      <ModulePageHeader
        icon={<Apartment />}
        title={`Hola, ${user?.nombres?.split(' ')[0] || 'Coordinación'}`}
        subtitle="Panel Ejecutivo – Visión general de todos los expedientes de práctica"
        action={(
          <Button variant="outlined" size="small" onClick={fetchData} startIcon={<Refresh />}>
            Actualizar
          </Button>
        )}
      />

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {!error && expedientes.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>No hay expedientes registrados en el sistema.</Alert>
      )}

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Indicadores Estadísticos
      </Typography>
      <StatStrip items={stats} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <ContentCard accent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontWeight: 600 }} variant="subtitle1">Resumen de Cerrados</Typography>
              <Chip label={`${avancePct}% cerrados`} size="small" color="primary" variant="outlined" />
            </Box>
            <LinearProgress variant="determinate" value={avancePct} sx={{ height: 10, borderRadius: 999, mb: 2 }} />
            <Typography variant="caption" color="text.secondary">
              {kpis.cerrados} expedientes cerrados · {kpis.enEjecucion} en ejecución
            </Typography>

            <Grid container spacing={2.5} sx={{ mt: 2 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 1 }}>
                  Expedientes por tipo de práctica
                </Typography>
                {tiposChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={tiposChart} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                        dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {tiposChart.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <ReTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>Sin datos</Typography>
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 1 }}>
                  Distribución por estado
                </Typography>
                {estadosChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={estadosChart} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <ReTooltip />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {estadosChart.map((entry) => (
                          <Cell key={entry.name} fill={ESTADO_COLOR[entry.name.replace(/ /g, '_')] || '#94a3b8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>Sin datos</Typography>
                )}
              </Grid>
            </Grid>
          </ContentCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <ContentCard accent sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="primary.dark" sx={{ mb: 2 }}>Accesos rápidos</Typography>
            <Stack spacing={1}>
              <Button variant="outlined" color="primary" startIcon={<Assignment />} onClick={() => navigate('/admin/expedientes')} sx={{ justifyContent: 'flex-start' }}>
                Ver expedientes
              </Button>
              <Button variant="outlined" startIcon={<Business />} onClick={() => navigate('/admin/sedes')} sx={{ justifyContent: 'flex-start', borderColor: 'divider', color: 'text.primary' }}>
                Ver sedes
              </Button>
              <Button variant="outlined" startIcon={<RateReview />} onClick={() => navigate('/coordinacion/reportes')} sx={{ justifyContent: 'flex-start', borderColor: 'divider', color: 'text.primary' }}>
                Reportes
              </Button>
            </Stack>
          </ContentCard>

          <ContentCard sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2" color="text.secondary">Últimos expedientes</Typography>
              <Button size="small" endIcon={<ChevronRight />} onClick={() => navigate('/admin/expedientes')}>
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
                    secondary={e.estado?.replace(/_/g, ' ')}
                    slotProps={{
                      primary: { variant: 'body2', fontWeight: 500 },
                      secondary: { variant: 'caption', sx: { textTransform: 'capitalize' } },
                    }}
                  />
                </ListItem>
              ))}
              {recientes.length === 0 && (
                <Typography variant="body2" color="text.secondary">No hay expedientes recientes.</Typography>
              )}
            </List>
          </ContentCard>

          <ContentCard>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Alertas activas</Typography>
            {alertas.length > 0 ? alertas.map((a, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.8, borderBottom: i < alertas.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <WarningAmber sx={{ fontSize: 18, color: a.severity === 'error' ? '#ef4444' : '#eab308' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 500 }} variant="body2">{a.exp}</Typography>
                  <Typography variant="caption" color="text.secondary">{a.estudiante}</Typography>
                </Box>
                <Chip label={a.tipo} size="small" color={a.severity === 'error' ? 'error' : 'warning'} />
              </Box>
            )) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>No hay alertas activas</Typography>
            )}
          </ContentCard>
        </Grid>
      </Grid>

      <ContentCard accent>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Listado de expedientes</Typography>

        <Box sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <TextField
            label="Buscar"
            placeholder="Estudiante o código"
            size="small"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
            sx={{ minWidth: 260 }}
          />
          <TextField
            select
            label="Tipo"
            size="small"
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
            sx={{ minWidth: 160, borderRadius: 2, bgcolor: '#fff' }}
          >
            <MenuItem value="TODOS">Todos</MenuItem>
            <MenuItem value="INICIAL">Inicial</MenuItem>
            <MenuItem value="FINAL">Final</MenuItem>
            <MenuItem value="PROFESIONAL">Profesional</MenuItem>
          </TextField>
          <TextField
            select
            label="Estado"
            size="small"
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            sx={{ minWidth: 190, borderRadius: 2, bgcolor: '#fff' }}
          >
            <MenuItem value="TODOS">Todos</MenuItem>
            {ESTADOS.map(s => <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>)}
          </TextField>
        </Box>

        <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estudiante</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Asesor / Empresa</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(e => (
                <TableRow key={e.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{e.codigoExpediente}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 500 }} variant="body2">{e.nombreEstudiante} {e.apellidoEstudiante}</Typography>
                  </TableCell>
                  <TableCell><Chip label={e.nombreTipoPractica} size="small" color="primary" variant="outlined" /></TableCell>
                  <TableCell><StatusChip status={e.estado} label={estadoLabel(e.estado)} /></TableCell>
                  <TableCell>
                    <Typography sx={{ display: 'block' }} variant="caption">{e.nombreAsesor || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">{e.nombreEmpresa || ''}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                       {puedeEmitirCarta && e.estado === 'VALIDADO_SECRETARIA' && (
                        <Tooltip title="Emitir y firmar Carta de Presentación">
                          <Button size="small" variant="contained" color="success"
                            onClick={() => handleEmitirCarta(e.id)}
                            sx={{ fontWeight: 600, fontSize: '0.7rem', whiteSpace: 'nowrap', px: 1 }}>
                            Emitir Carta
                          </Button>
                        </Tooltip>
                      )}
                      <Tooltip title="Ver detalle">
                        <Button size="small" variant="outlined" onClick={() => navigate(`/coordinacion/expedientes/${e.id}`)}>
                          <Visibility fontSize="small" />
                        </Button>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
               ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No se encontraron expedientes</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filtered.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0); }}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
          />
        </TableContainer>
      </ContentCard>
    </ModulePageShell>
  );
};
