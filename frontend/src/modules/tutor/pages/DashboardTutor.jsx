import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
  Chip, TextField, Button, Alert, CircularProgress,
  Card, CardContent, Grid, Tooltip,
} from '@mui/material';
import {
  PeopleAlt, PlaylistAddCheck, RateReview, Business,
  Visibility, Assignment,
} from '@mui/icons-material';
import { expedientesApi } from '../../../api/expedientesApi';

const ESTADO_COLOR = {
  SOLICITADO: 'default', EMPRESA_SEDE_ASIGNADA: 'info',
  ASESOR_ASIGNADO: 'info', PLAN_PRESENTADO: 'warning',
  EN_REVISION: 'warning', OBSERVADO: 'error', SUBSANADO: 'warning',
  APROBADO: 'success', EN_EJECUCION: 'primary',
  INFORME_PARCIAL_PRESENTADO: 'info', INFORME_FINAL_PRESENTADO: 'info',
  EVALUADO: 'success', CERRADO: 'default',
};

export default function DashboardTutor() {
  const navigate = useNavigate();
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    expedientesApi.getMisExpedientes()
      .then(({ data }) => setExpedientes(data?.data ?? data ?? []))
      .catch(() => setError('No se pudieron cargar los expedientes.'))
      .finally(() => setLoading(false));
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

  const MetricCard = ({ icon: Icon, label, value, color = 'primary.main' }) => (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: color.replace('main', 'light') || '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon sx={{ color, fontSize: 22 }} />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.2 }}>{label}</Typography>
        </Box>
        <Typography variant="h5" fontWeight={700} color="text.primary">{value}</Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>Panel del Tutor Externo</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Realiza el seguimiento de los practicantes asignados a tu empresa
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={3}><MetricCard icon={PeopleAlt} label="Practicantes asignados" value={kpis.total} /></Grid>
        <Grid item xs={6} sm={4} md={3}><MetricCard icon={PlaylistAddCheck} label="En ejecución" value={kpis.enEjecucion} color="primary.main" /></Grid>
        <Grid item xs={6} sm={4} md={3}><MetricCard icon={Business} label="Empresas" value={kpis.empresas} color="info.main" /></Grid>
        <Grid item xs={6} sm={4} md={3}><MetricCard icon={RateReview} label="Por evaluar" value={kpis.porEvaluar} color="secondary.main" /></Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField label="Buscar practicante" placeholder="Nombre, código o empresa" size="small"
          value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
          sx={{ minWidth: 300 }} />
      </Paper>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Estudiante</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Empresa / Sede</TableCell>
              <TableCell align="center">Acciones</TableCell>
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
                <TableCell><Chip label={e.estado?.replace(/_/g, ' ')} size="small" color={ESTADO_COLOR[e.estado] || 'default'} /></TableCell>
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
    </Box>
  );
}
