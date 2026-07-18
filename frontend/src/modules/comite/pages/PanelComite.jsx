import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
  Chip, TextField, MenuItem, Button, Alert, CircularProgress,
  Grid, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, LinearProgress, List, ListItem, ListItemText, ListItemIcon,
} from '@mui/material';
import {
  CheckCircle, Gavel, Visibility, WarningAmber,
  PeopleAlt, Assignment, RateReview, PlaylistAddCheck, Refresh,
  ChevronRight, Business,
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuth } from '../../../auth/AuthContext';
import { expedientesApi } from '../../../api/expedientesApi';
import {
  ModulePageShell, ModulePageHeader,
} from '../../../shared/components/module/ModulePageShell';
import ContentCard from '../../../shared/components/ContentCard';
import StatStrip from '../../../shared/components/StatStrip';
import StatusChip from '../../../shared/components/StatusChip';

const MySwal = withReactContent(Swal);
const esFinalOProfesional = (expediente) => ['FINAL', 'PROFESIONAL'].includes(expediente.codigoTipoPractica);

const ESTADOS_COMITE = [
  'SOLICITADO', 'EMPRESA_SEDE_ASIGNADA', 'COMITE_ASIGNADO',
  'CARTA_ACEPTACION_PRESENTADA', 'PLAN_PRESENTADO', 'EN_REVISION',
  'OBSERVADO', 'SUBSANADO', 'PLAN_APROBADO', 'EN_EJECUCION',
  'INFORME_PARCIAL_PRESENTADO', 'INFORME_FINAL_PRESENTADO',
  'INFORME_APROBADO', 'EVALUACION_COMPLETA', 'EVALUADO', 'DICTAMEN_EMITIDO', 'CERRADO',
];

export const PanelComite = () => {
  const { user } = useAuth();
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

  const fetchData = () => {
    setLoading(true);
    expedientesApi.getMisExpedientes()
      .then(({ data }) => setExpedientes(data?.data ?? data ?? []))
      .catch(() => setError('No se pudieron cargar los expedientes.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
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
    pendientes: expedientes.filter(e => esFinalOProfesional(e) && ['PLAN_PRESENTADO', 'EN_REVISION'].includes(e.estado)).length,
    enEjecucion: expedientes.filter(e => e.estado === 'EN_EJECUCION').length,
    infFinalPresentado: expedientes.filter(e => esFinalOProfesional(e) && e.estado === 'INFORME_FINAL_PRESENTADO').length,
    observados: expedientes.filter(e => e.estado === 'OBSERVADO').length,
    cerrados: expedientes.filter(e => e.estado === 'CERRADO').length,
  }), [expedientes]);

  const estadoChart = useMemo(() => ([
    { name: 'Plan por revisar', value: kpis.pendientes, color: '#f59e0b' },
    { name: 'En ejecución', value: kpis.enEjecucion, color: '#10b981' },
    { name: 'Inf. final x aprobar', value: kpis.infFinalPresentado, color: '#8b5cf6' },
    { name: 'Observados', value: kpis.observados, color: '#ef4444' },
    { name: 'Cerrados', value: kpis.cerrados, color: '#3b82f6' },
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
  const avancePct = kpis.total > 0 ? Math.round((kpis.cerrados / kpis.total) * 100) : 0;

  const recientes = useMemo(
    () => [...expedientes].slice(0, 5),
    [expedientes],
  );

  const pendientesAccion = useMemo(
    () => expedientes.filter((e) =>
      esFinalOProfesional(e) && (e.estado === 'PLAN_PRESENTADO' || e.estado === 'INFORME_FINAL_PRESENTADO')
    ),
    [expedientes],
  );

  const estadoLabel = (estado) => estado?.replace(/_/g, ' ').toLowerCase() || 'Pendiente';

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
      fetchData();
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
      fetchData();
    } catch {
      MySwal.fire('Error', 'No se pudo emitir el dictamen.', 'error');
    }
  };

  const handleObservarPlan = async (id) => {
    const result = await MySwal.fire({
      title: 'Observar plan de prácticas',
      input: 'textarea',
      inputLabel: 'Observaciones para el estudiante',
      inputPlaceholder: 'Detalle los aspectos que debe subsanar...',
      inputValidator: (value) => !value?.trim() && 'La observación es obligatoria.',
      showCancelButton: true,
      confirmButtonText: 'Registrar observación',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      await expedientesApi.agregarObservacion(id, result.value.trim());
      MySwal.fire('Plan observado', 'Se notificó la observación al estudiante.', 'success');
      fetchData();
    } catch (error) {
      MySwal.fire('Error', error.response?.data?.message || 'No se pudo registrar la observación.', 'error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  const stats = [
    { label: 'Total expedientes', value: kpis.total, icon: <PeopleAlt fontSize="small" />, accent: 'blue' },
    { label: 'Plan por revisar', value: kpis.pendientes, icon: <Assignment fontSize="small" />, accent: 'teal' },
    { label: 'En ejecución', value: kpis.enEjecucion, icon: <PlaylistAddCheck fontSize="small" />, accent: 'violet' },
    { label: 'Inf. final x aprobar', value: kpis.infFinalPresentado, icon: <RateReview fontSize="small" />, accent: 'emerald' },
  ];

  return (
    <ModulePageShell>
      <ModulePageHeader
        icon={<Business />}
        title={`Hola, ${user?.nombres?.split(' ')[0] || 'Comité'}`}
        subtitle="Panel del Comité de Prácticas · Revisa, aprueba planes, supervisa informes finales y emite dictámenes"
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
        >
          Hay {pendientesAccion.length} acción(es) pendiente(s) en el panel.
        </Alert>
      )}

      <StatStrip items={stats} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <ContentCard accent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontWeight: 600 }} variant="subtitle1">Resumen de Expedientes</Typography>
              <Chip label={`${avancePct}% cerrados`} size="small" color="primary" variant="outlined" />
            </Box>
            <LinearProgress variant="determinate" value={avancePct} sx={{ height: 10, borderRadius: 999, mb: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {kpis.cerrados} expedientes cerrados · {kpis.enEjecucion} en ejecución
            </Typography>

            <Grid container spacing={2.5} sx={{ mt: 1.5 }}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 1 }}>
                  Expedientes por Estado
                </Typography>
                <Box sx={{ height: 210, display: 'grid', placeItems: 'center' }}>
                  <Box
                    sx={{
                      width: 148,
                      height: 148,
                      borderRadius: '50%',
                      background: `conic-gradient(#10b981 0 ${kpis.total ? (kpis.cerrados / kpis.total) * 100 : 0}%, #f59e0b 0 ${kpis.total ? ((kpis.cerrados + kpis.pendientes) / kpis.total) * 100 : 0}%, #e0e7ff 0 100%)`,
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <Box sx={{ width: 104, height: 104, borderRadius: '50%', bgcolor: 'background.paper', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                      <Typography sx={{ fontWeight: 700 }} variant="h5" color="success.main">{kpis.cerrados}</Typography>
                      <Typography variant="caption" color="text.secondary">de {kpis.total}</Typography>
                    </Box>
                  </Box>
                </Box>
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: -1, flexWrap: 'wrap' }}>
                  <Chip size="small" icon={<PeopleAlt />} label={`${kpis.total} total`} color="primary" variant="outlined" />
                  <Chip size="small" icon={<WarningAmber />} label={`${kpis.observados} observados`} variant="outlined" />
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 7 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 1 }}>
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
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontSize: '0.65rem', lineHeight: 1.2, display: 'block' }}>
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
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              Expedientes por Modalidad
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
      </Grid>

      <ContentCard accent>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Lista de Expedientes</Typography>

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
            {ESTADOS_COMITE.map(s => <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>)}
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
                <TableCell align="center" sx={{ fontWeight: 600 }}>Acciones</TableCell>
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
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Ver detalle">
                        <Button size="small" variant="outlined" onClick={() => navigate(`/coordinacion/expedientes/${e.id}`)}>
                          <Visibility fontSize="small" />
                        </Button>
                      </Tooltip>
                      {esFinalOProfesional(e) && e.estado === 'PLAN_PRESENTADO' && (
                        <Tooltip title="Aprobar plan">
                          <Button size="small" variant="contained" color="success"
                            onClick={() => handleAction('aprobarPlan', e.id)}>
                            <CheckCircle fontSize="small" />
                          </Button>
                        </Tooltip>
                      )}
                      {esFinalOProfesional(e) && e.estado === 'PLAN_PRESENTADO' && (
                        <Tooltip title="Observar plan">
                          <Button size="small" variant="outlined" color="warning"
                            onClick={() => handleObservarPlan(e.id)}>
                            <WarningAmber fontSize="small" />
                          </Button>
                        </Tooltip>
                      )}
                      {esFinalOProfesional(e) && e.estado === 'INFORME_FINAL_PRESENTADO' && (
                        <Tooltip title="Aprobar informe final">
                          <Button size="small" variant="contained" color="info"
                            onClick={() => handleAction('aprobarInforme', e.id)}>
                            <CheckCircle fontSize="small" />
                          </Button>
                        </Tooltip>
                      )}
                      {esFinalOProfesional(e) && ['INFORME_APROBADO', 'EVALUACION_COMPLETA', 'EVALUADO'].includes(e.estado) && (
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
    </ModulePageShell>
  );
};
