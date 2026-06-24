import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
  Chip, TextField, MenuItem, Button, Alert, CircularProgress,
  Card, CardContent, Grid, Tooltip,
} from '@mui/material';
import {
  PeopleAlt, Assignment, PlaylistAddCheck, WarningAmber,
  RateReview, Business, School, Apartment,
  Visibility, CheckCircle,
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { expedientesApi } from '../../../api/expedientesApi';

const ESTADOS = [
  'SOLICITADO', 'EMPRESA_SEDE_ASIGNADA', 'ASESOR_ASIGNADO', 'COMITE_ASIGNADO',
  'CARTA_ACEPTACION_PRESENTADA', 'PLAN_PRESENTADO', 'EN_REVISION', 'OBSERVADO',
  'SUBSANADO', 'APROBADO', 'EN_EJECUCION', 'INFORME_PARCIAL_PRESENTADO',
  'INFORME_FINAL_PRESENTADO', 'EVALUADO', 'CERRADO',
];

const ESTADO_COLOR = {
  SOLICITADO: '#94a3b8', EMPRESA_SEDE_ASIGNADA: '#3b82f6',
  ASESOR_ASIGNADO: '#3b82f6', COMITE_ASIGNADO: '#3b82f6',
  CARTA_ACEPTACION_PRESENTADA: '#3b82f6', PLAN_PRESENTADO: '#eab308',
  EN_REVISION: '#eab308', OBSERVADO: '#ef4444', SUBSANADO: '#f59e0b',
  APROBADO: '#22c55e', EN_EJECUCION: '#6366f1',
  INFORME_PARCIAL_PRESENTADO: '#06b6d4', INFORME_FINAL_PRESENTADO: '#06b6d4',
  EVALUADO: '#22c55e', CERRADO: '#64748b',
};

const CHART_COLORS = ['#2563eb', '#0d9488', '#eab308', '#ef4444', '#6366f1', '#ec4899', '#f97316', '#06b6d4'];

const MetricCard = ({ icon: Icon, label, value, color = '#2563eb' }) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon sx={{ color, fontSize: 22 }} />
        </Box>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>{label}</Typography>
      </Box>
      <Typography variant="h5" fontWeight={700}>{value}</Typography>
    </CardContent>
  </Card>
);

export const DashboardCoordinacion = () => {
  const navigate = useNavigate();
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    expedientesApi.getAll()
      .then(({ data }) => setExpedientes(data?.data ?? data ?? []))
      .catch(() => setError('No se pudieron cargar los expedientes. Verifica la conexión.'))
      .finally(() => setLoading(false));
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

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>Dashboard de Coordinación</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Visión general de todos los expedientes de práctica preprofesional
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {!error && expedientes.length === 0 && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>No hay expedientes registrados en el sistema.</Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}><MetricCard icon={PeopleAlt} label="Total" value={kpis.total} /></Grid>
        <Grid item xs={6} sm={4} md={2}><MetricCard icon={PlaylistAddCheck} label="Activos" value={kpis.activos} color="#6366f1" /></Grid>
        <Grid item xs={6} sm={4} md={2}><MetricCard icon={Assignment} label="Plan pendiente" value={kpis.planPendiente} color="#eab308" /></Grid>
        <Grid item xs={6} sm={4} md={2}><MetricCard icon={WarningAmber} label="Observados" value={kpis.observados} color="#ef4444" /></Grid>
        <Grid item xs={6} sm={4} md={2}><MetricCard icon={RateReview} label="Por evaluar" value={kpis.porEvaluar} color="#ec4899" /></Grid>
        <Grid item xs={6} sm={4} md={2}><MetricCard icon={CheckCircle} label="Cerrados" value={kpis.cerrados} color="#22c55e" /></Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Expedientes por tipo de práctica</Typography>
              {tiposChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={tiposChart} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                      dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {tiposChart.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <ReTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>Sin datos</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Distribución por estado</Typography>
              {estadosChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={estadosChart} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <ReTooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {estadosChart.map((entry) => (
                        <Cell key={entry.name} fill={ESTADO_COLOR[entry.name.replace(/ /g, '_')] || '#94a3b8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>Sin datos</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Alertas</Typography>
              {alertas.length > 0 ? alertas.map((a, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.8, borderBottom: i < alertas.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <WarningAmber sx={{ fontSize: 18, color: a.severity === 'error' ? '#ef4444' : '#eab308' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500}>{a.exp}</Typography>
                    <Typography variant="caption" color="text.secondary">{a.estudiante}</Typography>
                  </Box>
                  <Chip label={a.tipo} size="small" color={a.severity === 'error' ? 'error' : 'warning'} />
                </Box>
              )) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>No hay alertas activas</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Distribución por tipo</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {tiposChart.map((t, i) => (
                  <Box key={t.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ flex: 1 }}>{t.name}</Typography>
                    <Typography variant="body2" fontWeight={600}>{t.value}</Typography>
                    <Typography variant="caption" color="text.secondary">({expedientes.length > 0 ? ((t.value / expedientes.length) * 100).toFixed(1) : 0}%)</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField label="Buscar" placeholder="Estudiante o código" size="small"
          value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(0); }} sx={{ minWidth: 260 }} />
        <TextField select label="Tipo" size="small" value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="TODOS">Todos</MenuItem>
          <MenuItem value="INICIAL">Inicial</MenuItem>
          <MenuItem value="FINAL">Final</MenuItem>
          <MenuItem value="PROFESIONAL">Profesional</MenuItem>
        </TextField>
        <TextField select label="Estado" size="small" value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)} sx={{ minWidth: 190 }}>
          <MenuItem value="TODOS">Todos</MenuItem>
          {ESTADOS.map(s => <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>)}
        </TextField>
      </Paper>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Estudiante</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Asesor / Empresa</TableCell>
              <TableCell align="center">Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(e => (
              <TableRow key={e.id} hover>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{e.codigoExpediente}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>{e.nombreEstudiante} {e.apellidoEstudiante}</Typography>
                </TableCell>
                <TableCell><Chip label={e.nombreTipoPractica} size="small" color="primary" variant="outlined" /></TableCell>
                <TableCell><Chip label={e.estado?.replace(/_/g, ' ')} size="small" color={e.estado === 'OBSERVADO' ? 'error' : e.estado === 'APROBADO' || e.estado === 'EVALUADO' || e.estado === 'CERRADO' ? 'success' : 'default'} /></TableCell>
                <TableCell>
                  <Typography variant="caption" display="block">{e.nombreAsesor || '—'}</Typography>
                  <Typography variant="caption" color="text.secondary">{e.nombreEmpresa || ''}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Ver detalle">
                    <Button size="small" variant="outlined" onClick={() => navigate(`/coordinacion/expedientes/${e.id}`)}>
                      <Visibility fontSize="small" />
                    </Button>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No se encontraron expedientes</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div"
          count={filtered.length} rowsPerPage={rowsPerPage} page={page}
          onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0); }} />
      </TableContainer>
    </Box>
  );
};
