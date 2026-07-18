import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
  Chip, TextField, MenuItem, Alert, CircularProgress,
  IconButton
} from '@mui/material';
import {
  Assignment, Refresh, Search, FolderOpen,
} from '@mui/icons-material';
import { expedientesApi } from '../../../api/expedientesApi';
import {
  ModulePageShell, ModulePageHeader,
} from '../../../shared/components/module/ModulePageShell';
import ContentCard from '../../../shared/components/ContentCard';
import StatStrip from '../../../shared/components/StatStrip';

const ESTADOS = [
  'SOLICITADO', 'EMPRESA_SEDE_ASIGNADA', 'ASESOR_ASIGNADO', 'COMITE_ASIGNADO',
  'VALIDADO_SECRETARIA', 'CARTA_PRESENTACION_EMITIDA', 'CARTA_ACEPTACION_PRESENTADA',
  'PLAN_PRESENTADO', 'PLAN_APROBADO', 'EN_REVISION', 'OBSERVADO', 'SUBSANADO',
  'EN_EJECUCION', 'INFORME_PARCIAL_PRESENTADO', 'INFORME_FINAL_PRESENTADO',
  'INFORME_APROBADO', 'EVALUACION_COMPLETA', 'EVALUADO', 'DICTAMEN_EMITIDO', 'CERRADO',
];

export const GestionExpedientes = () => {
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  const loadExpedientes = () => {
    setLoading(true);
    expedientesApi.getAll()
      .then(({ data }) => setExpedientes(data?.data ?? data ?? []))
      .catch(() => setError('No se pudieron cargar los expedientes.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadExpedientes();
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
    enEjecucion: expedientes.filter(e => e.estado === 'EN_EJECUCION').length,
    cerrados: expedientes.filter(e => e.estado === 'CERRADO').length,
  }), [expedientes]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  const stats = [
    { label: 'Total Expedientes', value: kpis.total, icon: <FolderOpen fontSize="small" />, accent: 'blue' },
    { label: 'Activos', value: kpis.activos, icon: <Assignment fontSize="small" />, accent: 'teal' },
    { label: 'En Ejecución', value: kpis.enEjecucion, icon: <Assignment fontSize="small" />, accent: 'violet' },
    { label: 'Cerrados', value: kpis.cerrados, icon: <FolderOpen fontSize="small" />, accent: 'emerald' },
  ];

  return (
    <ModulePageShell>
      <ModulePageHeader
        icon={<FolderOpen />}
        title="Gestión de Expedientes"
        subtitle="Listado y control de todos los expedientes de práctica"
        action={
          <IconButton onClick={loadExpedientes} size="small" aria-label="Actualizar">
            <Refresh fontSize="small" />
          </IconButton>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <StatStrip items={stats} />

      <ContentCard accent>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Directorio de Expedientes</Typography>

        <Box sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <TextField
            label="Buscar por estudiante o código"
            placeholder="Ej. Juan Pérez"
            size="small"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
            slotProps={{ input: { startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> } }}
            sx={{ minWidth: 260 }}
          />
          <TextField
            select
            label="Tipo de Práctica"
            size="small"
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="TODOS">Todos los tipos</MenuItem>
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
            sx={{ minWidth: 190 }}
          >
            <MenuItem value="TODOS">Todos los estados</MenuItem>
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
                  <TableCell><Chip label={e.estado?.replace(/_/g, ' ')} size="small" color={e.estado === 'OBSERVADO' ? 'error' : e.estado === 'APROBADO' || e.estado === 'EVALUADO' || e.estado === 'CERRADO' ? 'success' : 'default'} /></TableCell>
                  <TableCell>
                    <Typography sx={{ display: 'block' }} variant="caption">{e.nombreAsesor || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">{e.nombreEmpresa || ''}</Typography>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>No se encontraron expedientes</TableCell></TableRow>
              ) : null}
            </TableBody>
          </Table>
          <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div"
            count={filtered.length} rowsPerPage={rowsPerPage} page={page}
            onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0); }} />
        </TableContainer>
      </ContentCard>
    </ModulePageShell>
  );
};
