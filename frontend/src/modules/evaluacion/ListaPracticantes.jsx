import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, InputAdornment,
  LinearProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton,
} from '@mui/material';
import { Search, Description, ChevronRight, Groups } from '@mui/icons-material';
import { useAuth } from '../../auth/AuthContext';
import { expedientesApi } from '../../api/expedientesApi';
import { useNavigate } from 'react-router-dom';
import { hasAnyRole } from '../../shared/utils/roleRoutes';
import StatusChip from '../../shared/components/StatusChip';
import {
  ModulePageShell, ModulePageHeader, ModuleToolbar, ModuleTableContainer, moduleHeadCellSx,
} from '../../shared/components/module/ModulePageShell';

export const ListaPracticantes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [practicantes, setPracticantes] = useState([]);
  const [filteredPracticantes, setFilteredPracticantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const isTutor = hasAnyRole(user?.roles, ['TUTOR_EXTERNO']);

  useEffect(() => {
    const fetchPracticantes = async () => {
      try {
        setLoading(true);
        const res = await expedientesApi.getMisExpedientes();
        const data = res?.data?.data || [];
        setPracticantes(data);
        setFilteredPracticantes(data);
      } catch (err) {
        console.error('Error al cargar practicantes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPracticantes();
  }, [user]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFilteredPracticantes(
      practicantes.filter((p) =>
        p.nombreEstudiante?.toLowerCase().includes(q) ||
        p.apellidoEstudiante?.toLowerCase().includes(q) ||
        p.codigoEstudiantil?.toLowerCase().includes(q) ||
        p.nombreEmpresa?.toLowerCase().includes(q)
      )
    );
  }, [search, practicantes]);

  const handleEvaluar = (id) => {
    navigate(isTutor ? `/tutor/evaluaciones/${id}` : `/docente/evaluaciones/${id}`);
  };

  const estadoLabel = (estado) => {
    const map = {
      EN_EJECUCION: 'En ejecución',
      EVALUADO: 'Evaluado',
      CERRADO: 'Cerrado',
    };
    return map[estado] || estado?.replace(/_/g, ' ') || 'Pendiente';
  };

  return (
    <ModulePageShell>
      <ModulePageHeader
        icon={<Groups />}
        title="Practicantes asignados"
        subtitle="Gestione y evalúe a los estudiantes a su cargo"
      />

      <ModuleToolbar>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar por nombre, código o empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" color="action" />
              </InputAdornment>
            ),
            sx: { bgcolor: '#fff', borderRadius: 2 },
          }}
        />
      </ModuleToolbar>

      {loading ? (
        <LinearProgress />
      ) : filteredPracticantes.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, borderRadius: 3, textAlign: 'center', border: '1px solid #e0e0e0' }}>
          <Typography variant="body2" color="text.secondary">
            {search ? 'No hay resultados para la búsqueda.' : 'No hay practicantes asignados.'}
          </Typography>
          {search && (
            <Box sx={{ mt: 2 }}>
              <Button size="small" onClick={() => setSearch('')}>Limpiar búsqueda</Button>
            </Box>
          )}
        </Paper>
      ) : (
        <ModuleTableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={moduleHeadCellSx}>Estudiante</TableCell>
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
                    <Typography variant="caption" color="text.secondary">{p.codigoEstudiantil}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{p.nombreEmpresa || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">{p.nombreSede || ''}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{p.nombreTipoPractica || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={p.estado} label={estadoLabel(p.estado)} />
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/docente/documentos/${p.id}`)}
                      title="Documentos"
                    >
                      <Description fontSize="small" />
                    </IconButton>
                    <Button
                      size="small"
                      variant="contained"
                      endIcon={<ChevronRight />}
                      onClick={() => handleEvaluar(p.id)}
                    >
                      Evaluar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ModuleTableContainer>
      )}
    </ModulePageShell>
  );
};
