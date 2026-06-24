import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
  Chip, TextField, MenuItem, Button, Alert, CircularProgress,
  Card, CardContent, Grid, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  CheckCircle, Gavel, Visibility, WarningAmber,
  PeopleAlt, Assignment, RateReview, PlaylistAddCheck,
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { expedientesApi } from '../../../api/expedientesApi';

const MySwal = withReactContent(Swal);

const ESTADOS_COMITE = [
  'SOLICITADO', 'EMPRESA_SEDE_ASIGNADA', 'COMITE_ASIGNADO',
  'CARTA_ACEPTACION_PRESENTADA', 'PLAN_PRESENTADO', 'EN_REVISION',
  'OBSERVADO', 'SUBSANADO', 'APROBADO', 'EN_EJECUCION',
  'INFORME_PARCIAL_PRESENTADO', 'INFORME_FINAL_PRESENTADO',
  'EVALUADO', 'CERRADO',
];

const ESTADO_COLOR = {
  SOLICITADO: 'default', EMPRESA_SEDE_ASIGNADA: 'info',
  COMITE_ASIGNADO: 'info', CARTA_ACEPTACION_PRESENTADA: 'info',
  PLAN_PRESENTADO: 'warning', EN_REVISION: 'warning',
  OBSERVADO: 'error', SUBSANADO: 'warning',
  APROBADO: 'success', EN_EJECUCION: 'primary',
  INFORME_PARCIAL_PRESENTADO: 'info', INFORME_FINAL_PRESENTADO: 'info',
  EVALUADO: 'success', CERRADO: 'default',
};

export const PanelComite = () => {
  const navigate = useNavigate();
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  const [openDictamen, setOpenDictamen] = useState(false);
  const [dictamenExp, setDictamenExp] = useState(null);
  const [dictamenText, setDictamenText] = useState('');

  useEffect(() => {
    setLoading(true);
    expedientesApi.getAll()
      .then(({ data }) => setExpedientes(data?.data ?? data ?? []))
      .catch(() => setError('No se pudieron cargar los expedientes.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => expedientes.filter(e => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || (e.nombreEstudiante + ' ' + e.apellidoEstudiante).toLowerCase().includes(q)
      || e.codigoExpediente?.toLowerCase().includes(q);
    const matchTipo = filtroTipo === 'TODOS' || e.codigoTipoPractica === filtroTipo;
    const matchEstado = filtroEstado === 'TODOS' || e.estado === filtroEstado;
    return matchSearch && matchTipo && matchEstado;
  }), [expedientes, searchTerm, filtroTipo, filtroEstado]);

  const kpis = useMemo(() => ({
    total: expedientes.length,
    pendientes: expedientes.filter(e => ['PLAN_PRESENTADO', 'EN_REVISION'].includes(e.estado)).length,
    enEjecucion: expedientes.filter(e => e.estado === 'EN_EJECUCION').length,
    infFinalPresentado: expedientes.filter(e => e.estado === 'INFORME_FINAL_PRESENTADO').length,
    observados: expedientes.filter(e => e.estado === 'OBSERVADO').length,
  }), [expedientes]);

  const handleAction = async (action, id) => {
    const config = {
      aprobarPlan: { title: '¿Aprobar plan?', text: 'El plan de trabajo será marcado como aprobado.', icon: 'question', api: () => expedientesApi.aprobarPlan(id) },
      aprobarInforme: { title: '¿Aprobar informe final?', text: 'El informe final será aprobado por el comité.', icon: 'question', api: () => expedientesApi.aprobarInformeFinal(id) },
    };
    const c = config[action];
    if (!c) return;
    const result = await MySwal.fire({ title: c.title, text: c.text, icon: c.icon, showCancelButton: true, confirmButtonText: 'Sí, confirmar' });
    if (!result.isConfirmed) return;
    try {
      await c.api();
      MySwal.fire('Operación exitosa', '', 'success');
      setExpedientes(prev => prev.map(e => e.id === id ? { ...e, estado: action === 'aprobarPlan' ? 'APROBADO' : 'EVALUADO' } : e));
    } catch {
      MySwal.fire('Error', 'No se pudo completar la operación.', 'error');
    }
  };

  const handleEmitirDictamen = async () => {
    if (!dictamenText.trim() || !dictamenExp) return;
    try {
      await expedientesApi.emitirDictamen(dictamenExp.id, dictamenText);
      setOpenDictamen(false);
      setDictamenExp(null);
      setDictamenText('');
      MySwal.fire('Dictamen emitido', 'El dictamen final fue registrado exitosamente.', 'success');
    } catch {
      MySwal.fire('Error', 'No se pudo emitir el dictamen.', 'error');
    }
  };

  const MetricCard = ({ icon: Icon, label, value, color = 'primary.main' }) => (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: color.replace('main', 'light') || '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon sx={{ color, fontSize: 22 }} />
          </Box>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>{label}</Typography>
        </Box>
        <Typography variant="h5" fontWeight={700}>{value}</Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>Panel del Comité de Prácticas</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Revisa, aprueba planes, supervisa informes finales y emite dictámenes
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}><MetricCard icon={PeopleAlt} label="Total expedientes" value={kpis.total} /></Grid>
        <Grid item xs={6} sm={4} md={2}><MetricCard icon={Assignment} label="Plan por revisar" value={kpis.pendientes} color="warning.main" /></Grid>
        <Grid item xs={6} sm={4} md={2}><MetricCard icon={PlaylistAddCheck} label="En ejecución" value={kpis.enEjecucion} color="primary.main" /></Grid>
        <Grid item xs={6} sm={4} md={2}><MetricCard icon={RateReview} label="Inf. final x aprobar" value={kpis.infFinalPresentado} color="secondary.main" /></Grid>
        <Grid item xs={6} sm={4} md={2}><MetricCard icon={WarningAmber} label="Observados" value={kpis.observados} color="error.main" /></Grid>
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
          {ESTADOS_COMITE.map(s => <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>)}
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
              <TableCell align="center">Acciones</TableCell>
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
                <TableCell><Chip label={e.estado?.replace(/_/g, ' ')} size="small" color={ESTADO_COLOR[e.estado] || 'default'} /></TableCell>
                <TableCell>
                  <Typography variant="caption" display="block">{e.nombreAsesor || '—'}</Typography>
                  <Typography variant="caption" color="text.secondary">{e.nombreEmpresa || ''}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    <Tooltip title="Ver detalle">
                      <Button size="small" variant="outlined" onClick={() => navigate(`/coordinacion/expedientes/${e.id}`)}>
                        <Visibility fontSize="small" />
                      </Button>
                    </Tooltip>
                    {e.estado === 'PLAN_PRESENTADO' && (
                      <Tooltip title="Aprobar plan">
                        <Button size="small" variant="contained" color="success"
                          onClick={() => handleAction('aprobarPlan', e.id)}>
                          <CheckCircle fontSize="small" />
                        </Button>
                      </Tooltip>
                    )}
                    {e.estado === 'INFORME_FINAL_PRESENTADO' && (
                      <Tooltip title="Aprobar informe final">
                        <Button size="small" variant="contained" color="info"
                          onClick={() => handleAction('aprobarInforme', e.id)}>
                          <CheckCircle fontSize="small" />
                        </Button>
                      </Tooltip>
                    )}
                    {(e.estado === 'APROBADO' || e.estado === 'EVALUADO') && (
                      <Tooltip title="Emitir dictamen">
                        <Button size="small" variant="contained" color="secondary"
                          onClick={() => { setDictamenExp(e); setDictamenText(''); setOpenDictamen(true); }}>
                          <Gavel fontSize="small" />
                        </Button>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No hay expedientes</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div"
          count={filtered.length} rowsPerPage={rowsPerPage} page={page}
          onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0); }} />
      </TableContainer>

      <Dialog open={openDictamen} onClose={() => setOpenDictamen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Emitir Dictamen Final</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Expediente: {dictamenExp?.codigoExpediente} — {dictamenExp?.nombreEstudiante} {dictamenExp?.apellidoEstudiante}
          </Typography>
          <TextField fullWidth multiline rows={4} label="Detalle del dictamen"
            value={dictamenText} onChange={e => setDictamenText(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDictamen(false)}>Cancelar</Button>
          <Button onClick={handleEmitirDictamen} variant="contained" disabled={!dictamenText.trim()}>Emitir</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
