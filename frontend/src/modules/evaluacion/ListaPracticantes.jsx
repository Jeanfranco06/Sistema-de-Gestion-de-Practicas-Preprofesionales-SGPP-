import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Stack, Chip, CircularProgress, Tooltip,
} from '@mui/material';
import {
  Search, Description, ChevronRight, Groups, Clear, FilterList,
  Visibility, RateReview, Business,
} from '@mui/icons-material';
import { useAuth } from '../../auth/AuthContext';
import { expedientesApi } from '../../api/expedientesApi';
import { useNavigate } from 'react-router-dom';
import { hasAnyRole } from '../../shared/utils/roleRoutes';
import StatusChip from '../../shared/components/StatusChip';
import ContentCard from '../../shared/components/ContentCard';
import StatStrip from '../../shared/components/StatStrip';
import {
  ModulePageShell, ModulePageHeader, moduleHeadCellSx,
} from '../../shared/components/module/ModulePageShell';

const ESTADOS_FILTRO = [
  'TODOS', 'EN_EJECUCION', 'PLAN_PRESENTADO', 'OBSERVADO',
  'INFORME_PARCIAL_PRESENTADO', 'INFORME_FINAL_PRESENTADO', 'EVALUADO', 'CERRADO',
];

export const ListaPracticantes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [practicantes, setPracticantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');

  const isTutor = hasAnyRole(user?.roles, ['TUTOR_EXTERNO']);
  const basePath = isTutor ? '/tutor' : '/docente';

  useEffect(() => {
    const fetchPracticantes = async () => {
      try {
        setLoading(true);
        const res = await expedientesApi.getMisExpedientes();
        const data = res?.data?.data || res?.data || [];
        setPracticantes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error al cargar practicantes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPracticantes();
  }, [user]);

  const filteredPracticantes = useMemo(() => {
    const q = search.toLowerCase();
    return practicantes.filter((p) => {
      const matchSearch = !q
        || `${p.nombreEstudiante} ${p.apellidoEstudiante}`.toLowerCase().includes(q)
        || p.codigoEstudiantil?.toLowerCase().includes(q)
        || p.codigoExpediente?.toLowerCase().includes(q)
        || p.nombreEmpresa?.toLowerCase().includes(q);
      const matchEstado = filtroEstado === 'TODOS' || p.estado === filtroEstado;
      const matchTipo = filtroTipo === 'TODOS' || p.codigoTipoPractica === filtroTipo;
      return matchSearch && matchEstado && matchTipo;
    });
  }, [practicantes, search, filtroEstado, filtroTipo]);

  const stats = useMemo(() => ({
    total: practicantes.length,
    activos: practicantes.filter((p) => !['EVALUADO', 'CERRADO'].includes(p.estado)).length,
    enEjecucion: practicantes.filter((p) => p.estado === 'EN_EJECUCION').length,
    porEvaluar: practicantes.filter((p) => ['INFORME_PARCIAL_PRESENTADO', 'INFORME_FINAL_PRESENTADO'].includes(p.estado)).length,
  }), [practicantes]);

  const handleEvaluar = (id) => {
    navigate(`${basePath}/evaluaciones/${id}`);
  };

  const limpiarFiltros = () => {
    setSearch('');
    setFiltroEstado('TODOS');
    setFiltroTipo('TODOS');
  };

  const estadoLabel = (estado) => estado?.replace(/_/g, ' ').toLowerCase() || 'Pendiente';

  const statItems = [
    { label: 'Total', value: stats.total, icon: <Groups fontSize="small" />, accent: 'blue' },
    { label: 'Activos', value: stats.activos, icon: <Business fontSize="small" />, accent: 'teal' },
    { label: 'En ejecución', value: stats.enEjecucion, icon: <RateReview fontSize="small" />, accent: 'violet' },
    { label: 'Por evaluar', value: stats.porEvaluar, icon: <Description fontSize="small" />, accent: 'emerald' },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <ModulePageShell>
      <ModulePageHeader
        icon={<Groups />}
        title="Mis practicantes"
        subtitle={isTutor
          ? 'Estudiantes asignados a tu tutoría externa'
          : 'Gestiona y evalúa a los estudiantes bajo tu asesoría'}
        action={(
          <Chip label={`${filteredPracticantes.length} resultados`} size="small" color="primary" variant="outlined" />
        )}
      />

      <StatStrip items={statItems} />

      <ContentCard>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <FilterList color="primary" />
          <Typography variant="subtitle1" fontWeight={600}>Filtros de búsqueda</Typography>
        </Box>

        <Stack spacing={2.5}>
          <TextField
            fullWidth
            placeholder="Buscar por nombre, código, expediente o empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                endAdornment: search && (
                  <IconButton onClick={() => setSearch('')} size="small">
                    <Clear />
                  </IconButton>
                ),
              },
            }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              select
              fullWidth
              label="Estado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              {ESTADOS_FILTRO.map((s) => (
                <MenuItem key={s} value={s}>
                  {s === 'TODOS' ? 'Todos' : s.replace(/_/g, ' ')}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Modalidad"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <MenuItem value="TODOS">Todas</MenuItem>
              <MenuItem value="INICIAL">Inicial</MenuItem>
              <MenuItem value="FINAL">Final</MenuItem>
              <MenuItem value="PROFESIONAL">Profesional</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" size="medium" onClick={limpiarFiltros} startIcon={<Clear />}>
              Limpiar filtros
            </Button>
          </Box>
        </Stack>
      </ContentCard>

      {filteredPracticantes.length === 0 ? (
        <ContentCard sx={{ textAlign: 'center', py: 6 }}>
          <Groups sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom fontWeight="bold">
            {search || filtroEstado !== 'TODOS' || filtroTipo !== 'TODOS'
              ? 'No se encontraron practicantes'
              : 'No hay practicantes asignados'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {search || filtroEstado !== 'TODOS' || filtroTipo !== 'TODOS'
              ? 'Intenta ajustar los filtros de búsqueda.'
              : 'Cuando te asignen estudiantes, aparecerán aquí.'}
          </Typography>
          {(search || filtroEstado !== 'TODOS' || filtroTipo !== 'TODOS') && (
            <Button variant="outlined" onClick={limpiarFiltros} startIcon={<Clear />}>
              Limpiar filtros
            </Button>
          )}
        </ContentCard>
      ) : (
        <ContentCard accent noPadding sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={moduleHeadCellSx}>Estudiante</TableCell>
                  <TableCell sx={moduleHeadCellSx}>Expediente</TableCell>
                  <TableCell sx={moduleHeadCellSx}>Empresa</TableCell>
                  <TableCell sx={moduleHeadCellSx}>Modalidad</TableCell>
                  <TableCell sx={moduleHeadCellSx}>Estado</TableCell>
                  <TableCell align="right" sx={moduleHeadCellSx}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPracticantes.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {p.nombreEstudiante} {p.apellidoEstudiante}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {p.codigoEstudiantil || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                        {p.codigoExpediente || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{p.nombreEmpresa || '—'}</Typography>
                      <Typography variant="caption" color="text.secondary">{p.nombreSede || ''}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={p.nombreTipoPractica || p.codigoTipoPractica || '—'} size="small" variant="outlined" color="primary" />
                    </TableCell>
                    <TableCell>
                      <StatusChip status={p.estado} label={estadoLabel(p.estado)} />
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Tooltip title="Ver expediente">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/coordinacion/expedientes/${p.id}`)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Documentos">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/docente/documentos/${p.id}`)}
                        >
                          <Description fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Button
                        size="small"
                        variant="contained"
                        endIcon={<ChevronRight />}
                        onClick={() => handleEvaluar(p.id)}
                        sx={{ ml: 0.5 }}
                      >
                        Evaluar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </ContentCard>
      )}
    </ModulePageShell>
  );
};
